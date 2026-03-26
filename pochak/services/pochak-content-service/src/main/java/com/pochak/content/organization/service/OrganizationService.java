package com.pochak.content.organization.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.organization.dto.*;
import com.pochak.content.organization.entity.*;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.repository.OrganizationRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public Page<OrganizationListResponse> listOrganizations(String orgType,
                                                             Long parentId,
                                                             Long sportId,
                                                             String keyword,
                                                             Pageable pageable) {
        Organization.OrgType type = null;
        if (orgType != null) {
            try {
                type = Organization.OrgType.valueOf(orgType);
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid org type: " + orgType);
            }
        }

        Page<Organization> page = organizationRepository.findWithFilters(type, parentId, sportId, keyword, pageable);
        return page.map(OrganizationListResponse::from);
    }

    public OrganizationDetailResponse getOrganizationDetail(Long id) {
        Organization org = findActiveOrganization(id);
        List<Organization> children = organizationRepository.findByParentIdAndActiveTrue(id);
        return OrganizationDetailResponse.from(org, children);
    }

    @Transactional
    public OrganizationDetailResponse createOrganization(CreateOrganizationRequest request) {
        Organization.OrgType orgType;
        try {
            orgType = Organization.OrgType.valueOf(request.getOrgType());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid org type: " + request.getOrgType());
        }

        Organization parent = null;
        if (request.getParentId() != null) {
            parent = organizationRepository.findByIdAndActiveTrue(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                            "Parent organization not found: " + request.getParentId()));
        }

        // PRIVATE org with parentId means it's a branch - parent must exist
        if (orgType == Organization.OrgType.PRIVATE && request.getParentId() != null && parent == null) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Branch (PRIVATE with parentId) requires an existing parent organization");
        }

        // Acquire advisory lock on parent to prevent concurrent DAG modifications
        if (request.getParentId() != null) {
            acquireHierarchyLock(request.getParentId());
        }

        // Validate parent relationship (cycle detection + depth limit)
        validateParentRelationship(null, request.getParentId());

        // Parse access type
        Organization.AccessType accessType = Organization.AccessType.OPEN;
        if (request.getAccessType() != null) {
            try {
                accessType = Organization.AccessType.valueOf(request.getAccessType());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid access type: " + request.getAccessType());
            }
        }

        // Parse default content visibility
        Organization.ContentVisibility contentVisibility = Organization.ContentVisibility.PUBLIC;
        if (request.getDefaultContentVisibility() != null) {
            try {
                contentVisibility = Organization.ContentVisibility.valueOf(request.getDefaultContentVisibility());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "Invalid content visibility: " + request.getDefaultContentVisibility());
            }
        }

        Organization organization = Organization.builder()
                .name(request.getName())
                .nameEn(request.getNameEn())
                .description(request.getDescription())
                .orgType(orgType)
                .parent(parent)
                .sportId(request.getSportId())
                .logoUrl(request.getLogoUrl())
                .websiteUrl(request.getWebsiteUrl())
                .canHostCompetition(request.getCanHostCompetition() != null ? request.getCanHostCompetition() : false)
                .isAutoJoin(request.getIsAutoJoin() != null ? request.getIsAutoJoin() : false)
                .accessType(accessType)
                .autoApprove(request.getAutoApprove())
                .managerOnlyBooking(request.getManagerOnlyBooking())
                .defaultContentVisibility(contentVisibility)
                .build();

        // Apply access type defaults if explicit values not provided
        if (request.getAutoApprove() == null && request.getManagerOnlyBooking() == null
                && request.getDefaultContentVisibility() == null) {
            if (accessType == Organization.AccessType.OPEN) {
                organization.applyOpenDefaults();
            } else {
                organization.applyClosedDefaults();
            }
        }

        Organization saved = organizationRepository.save(organization);
        return OrganizationDetailResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public OrganizationDetailResponse updateOrganization(Long id, UpdateOrganizationRequest request) {
        Organization org = findActiveOrganization(id);

        // Validate and update parent if parentId is provided
        if (request.getParentId() != null) {
            // Acquire advisory locks on both orgs in ascending ID order to prevent deadlocks.
            // Without consistent ordering, two concurrent requests (A->B and B->A) would deadlock.
            long lockFirst = Math.min(id, request.getParentId());
            long lockSecond = Math.max(id, request.getParentId());
            acquireHierarchyLock(lockFirst);
            if (lockFirst != lockSecond) {
                acquireHierarchyLock(lockSecond);
            }

            validateParentRelationship(id, request.getParentId());
            Organization newParent = organizationRepository.findByIdAndActiveTrue(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                            "상위 단체를 찾을 수 없습니다: " + request.getParentId()));
            org.updateParent(newParent);
        }

        Organization.OrgType orgType = null;
        if (request.getOrgType() != null) {
            try {
                orgType = Organization.OrgType.valueOf(request.getOrgType());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid org type: " + request.getOrgType());
            }
        }

        // Parse access type for update
        Organization.AccessType updateAccessType = null;
        if (request.getAccessType() != null) {
            try {
                updateAccessType = Organization.AccessType.valueOf(request.getAccessType());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid access type: " + request.getAccessType());
            }
        }

        // Parse content visibility for update
        Organization.ContentVisibility updateVisibility = null;
        if (request.getDefaultContentVisibility() != null) {
            try {
                updateVisibility = Organization.ContentVisibility.valueOf(request.getDefaultContentVisibility());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "Invalid content visibility: " + request.getDefaultContentVisibility());
            }
        }

        // Parse new v2 enums
        DisplayArea updateDisplayArea = null;
        if (request.getDisplayArea() != null) {
            try { updateDisplayArea = DisplayArea.valueOf(request.getDisplayArea()); }
            catch (IllegalArgumentException e) { /* ignore invalid */ }
        }
        JoinPolicy updateJoinPolicy = null;
        if (request.getJoinPolicy() != null) {
            try { updateJoinPolicy = JoinPolicy.valueOf(request.getJoinPolicy()); }
            catch (IllegalArgumentException e) { /* ignore invalid */ }
        }
        ReservationPolicy updateReservationPolicy = null;
        if (request.getReservationPolicy() != null) {
            try { updateReservationPolicy = ReservationPolicy.valueOf(request.getReservationPolicy()); }
            catch (IllegalArgumentException e) { /* ignore invalid */ }
        }

        org.update(
                request.getName(),
                request.getNameEn(),
                request.getDescription(),
                orgType,
                request.getSportId(),
                request.getLogoUrl(),
                request.getWebsiteUrl(),
                request.getCanHostCompetition(),
                request.getIsAutoJoin(),
                updateAccessType,
                request.getAutoApprove(),
                request.getManagerOnlyBooking(),
                updateVisibility,
                updateDisplayArea,
                request.getIsVerified(),
                request.getSiGunGuCode(),
                request.getIsCug(),
                updateJoinPolicy,
                updateReservationPolicy
        );

        // If access type changed and no explicit overrides, apply defaults
        if (updateAccessType != null && request.getAutoApprove() == null
                && request.getManagerOnlyBooking() == null && request.getDefaultContentVisibility() == null) {
            if (updateAccessType == Organization.AccessType.OPEN) {
                org.applyOpenDefaults();
            } else {
                org.applyClosedDefaults();
            }
        }

        // Policy v2 invariant: CITY organizations must be open and non-CUG
        if (org.getDisplayArea() == DisplayArea.CITY) {
            if (Boolean.TRUE.equals(org.getIsCug())) {
                org.clearCug();
                log.info("[Policy] CITY org cannot be CUG. Cleared CUG for orgId={}", org.getId());
            }
            if (org.getJoinPolicy() != JoinPolicy.OPEN) {
                org.setJoinPolicy(JoinPolicy.OPEN);
                log.info("[Policy] CITY org must have OPEN join policy. Updated orgId={}", org.getId());
            }
            if (org.getDefaultContentVisibility() != Organization.ContentVisibility.PUBLIC) {
                org.setDefaultContentVisibility(Organization.ContentVisibility.PUBLIC);
                log.info("[Policy] CITY org content must be PUBLIC. Updated orgId={}", org.getId());
            }
        }

        List<Organization> children = organizationRepository.findByParentIdAndActiveTrue(id);
        return OrganizationDetailResponse.from(org, children);
    }

    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public void deleteOrganization(Long id) {
        Organization org = findActiveOrganization(id);
        cascadeDeleteOrganization(org);
    }

    /**
     * Recursively soft-delete an organization and cascade to children and memberships.
     */
    private void cascadeDeleteOrganization(Organization org) {
        Long orgId = org.getId();
        log.info("[Cascade Delete] Starting soft-delete cascade for organization id={}, name='{}'", orgId, org.getName());

        // 1. Recursively soft-delete child organizations
        List<Organization> children = organizationRepository.findByParentIdAndActiveTrue(orgId);
        if (!children.isEmpty()) {
            log.info("[Cascade Delete] Soft-deleting {} child organization(s) of org id={}", children.size(), orgId);
            for (Organization child : children) {
                cascadeDeleteOrganization(child);
            }
        }

        // 2. Deactivate all active memberships for this organization
        List<Membership> memberships = membershipRepository.findByTargetTypeAndTargetIdAndActiveTrue(
                Membership.TargetType.ORGANIZATION, orgId);
        if (!memberships.isEmpty()) {
            log.info("[Cascade Delete] Deactivating {} membership(s) for org id={}", memberships.size(), orgId);
            for (Membership membership : memberships) {
                membership.deactivate();
            }
        }

        // 3. Content: org-owned content lives in separate asset tables; log a warning for manual review
        log.warn("[Cascade Delete] Organization id={} deleted — review org-owned content/assets for cleanup", orgId);

        // 4. Soft-delete the organization itself
        org.softDelete();
        log.info("[Cascade Delete] Organization id={} soft-deleted successfully", orgId);
    }

    public List<OrganizationListResponse> getChildren(Long id) {
        // Verify parent exists
        findActiveOrganization(id);
        List<Organization> children = organizationRepository.findByParentIdAndActiveTrue(id);
        return children.stream().map(OrganizationListResponse::from).toList();
    }

    /**
     * Validate parent relationship to prevent cycles and enforce depth limit.
     *
     * @param organizationId the ID of the organization being created/updated (null for new orgs)
     * @param parentId       the proposed parent ID
     */
    private void validateParentRelationship(Long organizationId, Long parentId) {
        if (parentId == null) return;

        // Cannot set self as parent
        if (organizationId != null && organizationId.equals(parentId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "단체는 자기 자신을 상위 단체로 설정할 수 없습니다.");
        }

        // Cycle detection: walk up parent chain
        Set<Long> visited = new HashSet<>();
        Long currentId = parentId;
        int depth = 1;

        while (currentId != null) {
            if (organizationId != null && currentId.equals(organizationId)) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "순환 참조가 감지되었습니다. 상위 단체를 확인해주세요.");
            }
            if (!visited.add(currentId)) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "단체 계층 구조에 순환 참조가 존재합니다.");
            }

            final Long lookupId = currentId;
            Organization parent = organizationRepository.findById(lookupId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                            "상위 단체를 찾을 수 없습니다: " + lookupId));
            currentId = parent.getParent() != null ? parent.getParent().getId() : null;
            depth++;
        }

        // Depth limit: max 5 levels
        if (depth > 5) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "단체 계층은 최대 5단계까지만 허용됩니다. (현재: " + depth + "단계)");
        }
    }

    /**
     * Acquire a PostgreSQL advisory lock scoped to the current transaction.
     * Prevents concurrent modifications to the organization hierarchy (DAG).
     * The lock is automatically released when the transaction ends.
     *
     * @param orgId the organization ID to lock on
     */
    private void acquireHierarchyLock(Long orgId) {
        entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(:lockKey)")
                .setParameter("lockKey", orgId)
                .getSingleResult();
    }

    private Organization findActiveOrganization(Long id) {
        return organizationRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Organization not found: " + id));
    }
}
