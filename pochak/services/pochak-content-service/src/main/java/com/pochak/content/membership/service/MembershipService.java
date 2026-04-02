package com.pochak.content.membership.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.client.IdentityGuardianClient;
import com.pochak.content.membership.dto.*;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.entity.JoinPolicy;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final OrganizationRepository organizationRepository;
    private final IdentityGuardianClient identityGuardianClient;

    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public MembershipResponse createMembership(CreateMembershipRequest request) {
        Membership.TargetType targetType;
        try {
            targetType = Membership.TargetType.valueOf(request.getTargetType());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid target type: " + request.getTargetType());
        }

        // Check if membership already exists
        if (membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                request.getUserId(), targetType, request.getTargetId())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Membership already exists for user " + request.getUserId());
        }

        // Determine role
        Membership.MembershipRole role = Membership.MembershipRole.MEMBER;
        if (request.getRole() != null) {
            try {
                role = Membership.MembershipRole.valueOf(request.getRole());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid role: " + request.getRole());
            }
        }

        // For TEAM target, only individual roles (PLAYER, COACH, GUARDIAN) are allowed
        if (targetType == Membership.TargetType.TEAM) {
            if (role != Membership.MembershipRole.PLAYER
                    && role != Membership.MembershipRole.COACH
                    && role != Membership.MembershipRole.GUARDIAN
                    && role != Membership.MembershipRole.ADMIN
                    && role != Membership.MembershipRole.MANAGER) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "Invalid role for team membership: " + role);
            }
        }

        // BIZ-005: GUARDIAN role requires a verified guardian relationship in identity-service
        if (role == Membership.MembershipRole.GUARDIAN) {
            if (request.getGuardianForUserId() == null) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "guardianForUserId is required when assigning GUARDIAN role");
            }
            boolean verified = identityGuardianClient.isVerifiedGuardian(
                    request.getUserId(), request.getGuardianForUserId());
            if (!verified) {
                log.warn("GUARDIAN membership rejected: no verified relationship between guardian={} and minor={}",
                        request.getUserId(), request.getGuardianForUserId());
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "No verified guardian relationship exists for this user. "
                        + "Guardian authentication must be completed in identity-service first.");
            }
        }

        // Determine approval status based on org's auto-join setting
        Membership.ApprovalStatus approvalStatus = Membership.ApprovalStatus.PENDING;
        Membership.JoinType joinType = Membership.JoinType.REQUEST;

        if (targetType == Membership.TargetType.ORGANIZATION) {
            Organization org = organizationRepository.findByIdAndActiveTrue(request.getTargetId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                            "Organization not found: " + request.getTargetId()));
            if (Boolean.TRUE.equals(org.getIsAutoJoin())) {
                approvalStatus = Membership.ApprovalStatus.APPROVED;
                joinType = Membership.JoinType.AUTO;
            }
        }

        Membership membership = Membership.builder()
                .userId(request.getUserId())
                .targetType(targetType)
                .targetId(request.getTargetId())
                .role(role)
                .positionId(request.getPositionId())
                .uniformNumber(request.getUniformNumber())
                .nickname(request.getNickname())
                .joinType(joinType)
                .approvalStatus(approvalStatus)
                .build();

        Membership saved = membershipRepository.save(membership);
        return MembershipResponse.from(saved);
    }

    public List<MembershipResponse> listMemberships(Long userId, String targetType, Long targetId) {
        List<Membership> memberships;

        if (userId != null) {
            memberships = membershipRepository.findByUserId(userId);
        } else if (targetType != null && targetId != null) {
            Membership.TargetType type;
            try {
                type = Membership.TargetType.valueOf(targetType);
            } catch (IllegalArgumentException e) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid target type: " + targetType);
            }
            memberships = membershipRepository.findByTargetTypeAndTargetId(type, targetId);
        } else {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Either userId or targetType+targetId must be provided");
        }

        return memberships.stream().map(MembershipResponse::from).toList();
    }

    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public MembershipResponse updateRole(Long id, UpdateMembershipRoleRequest request) {
        Membership membership = findMembership(id);

        Membership.MembershipRole newRole;
        try {
            newRole = Membership.MembershipRole.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid role: " + request.getRole());
        }

        // BIZ-005: Cannot change role TO guardian via update — must use createMembership with guardianForUserId
        if (newRole == Membership.MembershipRole.GUARDIAN
                && membership.getRole() != Membership.MembershipRole.GUARDIAN) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Cannot change role to GUARDIAN via update. "
                    + "Create a new GUARDIAN membership with guardianForUserId instead.");
        }

        membership.updateRole(newRole);
        return MembershipResponse.from(membership);
    }

    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public void deleteMembership(Long id) {
        Membership membership = findMembership(id);
        membership.deactivate();
    }

    /**
     * Join an organization based on joinPolicy:
     * - OPEN → auto-approve (APPROVED, joinType=AUTO)
     * - APPROVAL → pending (PENDING, joinType=REQUEST)
     * - INVITE_ONLY → reject with error
     */
    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public MembershipResponse joinOrganization(Long userId, Long orgId, String nickname) {
        Organization org = organizationRepository.findByIdAndActiveTrue(orgId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Organization not found: " + orgId));

        // Check duplicate
        if (membershipRepository.existsByUserIdAndTargetTypeAndTargetIdAndActiveTrue(
                userId, Membership.TargetType.ORGANIZATION, orgId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "User already has an active membership for this organization");
        }

        JoinPolicy joinPolicy = org.getJoinPolicy();

        if (joinPolicy == JoinPolicy.INVITE_ONLY) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "이 단체는 초대를 통해서만 가입할 수 있습니다.");
        }

        Membership.ApprovalStatus status;
        Membership.JoinType joinType;

        if (joinPolicy == JoinPolicy.OPEN) {
            status = Membership.ApprovalStatus.APPROVED;
            joinType = Membership.JoinType.AUTO;
        } else {
            // APPROVAL
            status = Membership.ApprovalStatus.PENDING;
            joinType = Membership.JoinType.REQUEST;
        }

        Membership membership = Membership.builder()
                .userId(userId)
                .targetType(Membership.TargetType.ORGANIZATION)
                .targetId(orgId)
                .role(Membership.MembershipRole.MEMBER)
                .nickname(nickname)
                .joinType(joinType)
                .approvalStatus(status)
                .build();

        if (joinPolicy == JoinPolicy.OPEN) {
            membership.approve(null); // auto-approved, no manager
        }

        Membership saved = membershipRepository.save(membership);
        return MembershipResponse.from(saved);
    }

    /**
     * Approve a pending membership. Only MANAGER or ADMIN can approve.
     */
    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public MembershipResponse approveMembership(Long membershipId, Long managerId) {
        Membership membership = findMembership(membershipId);
        if (membership.getApprovalStatus() != Membership.ApprovalStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Membership is not in PENDING status: " + membership.getApprovalStatus());
        }

        validateManagerRole(managerId, membership.getTargetType(), membership.getTargetId());

        membership.approve(managerId);
        return MembershipResponse.from(membership);
    }

    /**
     * Reject a pending membership. Only MANAGER or ADMIN can reject.
     */
    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public MembershipResponse rejectMembership(Long membershipId, Long managerId, String reason) {
        Membership membership = findMembership(membershipId);
        if (membership.getApprovalStatus() != Membership.ApprovalStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Membership is not in PENDING status: " + membership.getApprovalStatus());
        }

        validateManagerRole(managerId, membership.getTargetType(), membership.getTargetId());

        membership.reject(managerId, reason);
        return MembershipResponse.from(membership);
    }

    /**
     * List pending memberships for an organization (manager view).
     */
    public List<MembershipResponse> listPendingMemberships(Long orgId) {
        return membershipRepository.findByTargetTypeAndTargetIdAndActiveTrueAndApprovalStatus(
                        Membership.TargetType.ORGANIZATION, orgId, Membership.ApprovalStatus.PENDING)
                .stream()
                .map(MembershipResponse::from)
                .toList();
    }

    /**
     * Validate that the given user is a MANAGER or ADMIN of the target entity.
     */
    private void validateManagerRole(Long userId, Membership.TargetType targetType, Long targetId) {
        Membership managerMembership = membershipRepository
                .findByUserIdAndTargetTypeAndTargetIdAndActiveTrue(userId, targetType, targetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN,
                        "User is not a member of this organization"));

        if (managerMembership.getRole() != Membership.MembershipRole.MANAGER
                && managerMembership.getRole() != Membership.MembershipRole.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Only MANAGER or ADMIN can perform this action");
        }
    }

    private Membership findMembership(Long id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Membership not found: " + id));
    }
}
