package com.pochak.content.acl.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.acl.dto.SetAclRequest;
import com.pochak.content.acl.dto.VideoAclResponse;
import com.pochak.content.acl.entity.VideoAcl;
import com.pochak.content.acl.repository.VideoAclRepository;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.client.CommerceEntitlementClient;
import com.pochak.content.client.dto.CommerceEntitlementCheckResponse;
import com.pochak.content.client.dto.EntitlementResult;
import com.pochak.content.entitlement.dto.AccessCheckResponse;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VideoAclService {

    private final VideoAclRepository videoAclRepository;
    private final MembershipRepository membershipRepository;
    private final CommerceEntitlementClient commerceEntitlementClient;
    private final OrganizationRepository organizationRepository;
    private final LiveAssetRepository liveAssetRepository;
    private final VodAssetRepository vodAssetRepository;
    private final ClipAssetRepository clipAssetRepository;

    @Cacheable(value = "acl", key = "#type + ':' + #contentId + ':' + #userId", unless = "#result == null")
    public AccessCheckResponse evaluateAccess(String type, Long contentId, Long userId) {
        VideoAcl.ContentType contentType;
        try {
            contentType = VideoAcl.ContentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid content type: " + type);
        }

        // Load ACL for this content
        VideoAcl acl = videoAclRepository.findByContentTypeAndContentId(contentType, contentId)
                .orElse(null);

        // No ACL defined -> default to public access
        if (acl == null) {
            return AccessCheckResponse.grantAccess("PUBLIC");
        }

        VideoAcl.DefaultPolicy defaultPolicy = acl.getDefaultPolicy();
        Map<String, Object> policy = acl.getPolicy();

        // Check blocked users first
        if (policy != null && policy.containsKey("blockedUsers")) {
            @SuppressWarnings("unchecked")
            List<Number> blockedUsers = (List<Number>) policy.get("blockedUsers");
            if (userId != null && blockedUsers.stream().anyMatch(id -> id.longValue() == userId)) {
                return AccessCheckResponse.denyAccess("USER_BLOCKED");
            }
        }

        // Check allowed users (explicit whitelist overrides everything)
        if (policy != null && policy.containsKey("allowedUsers")) {
            @SuppressWarnings("unchecked")
            List<Number> allowedUsers = (List<Number>) policy.get("allowedUsers");
            if (userId != null && allowedUsers.stream().anyMatch(id -> id.longValue() == userId)) {
                return AccessCheckResponse.grantAccess("ALLOWED_USER");
            }
        }

        // Evaluate based on default policy
        AccessCheckResponse primaryResult;
        switch (defaultPolicy) {
            case PUBLIC:
                primaryResult = AccessCheckResponse.grantAccess("PUBLIC");
                break;

            case AUTHENTICATED:
                if (userId != null) {
                    primaryResult = AccessCheckResponse.grantAccess("AUTHENTICATED");
                } else {
                    primaryResult = AccessCheckResponse.denyAccess("AUTHENTICATION_REQUIRED");
                }
                break;

            case SUBSCRIBERS:
                if (userId == null) {
                    primaryResult = AccessCheckResponse.denyAccess("AUTHENTICATION_REQUIRED");
                } else {
                    primaryResult = evaluateSubscriberAccess(userId);
                }
                break;

            case MEMBERS_ONLY:
                // CUG (Closed User Group) content access control:
                // If content owner is a CUG organization, PUBLIC-visibility content is allowed (홍보용).
                // MEMBERS_ONLY visibility content requires membership check as usual.
                AccessCheckResponse cugResult = evaluateCugAccess(contentType, contentId);
                if (cugResult != null) {
                    primaryResult = cugResult;
                } else {
                    primaryResult = evaluateMembersOnlyAccess(userId, policy);
                }
                break;

            case PRIVATE:
                primaryResult = AccessCheckResponse.denyAccess("PRIVATE_CONTENT");
                break;

            default:
                primaryResult = AccessCheckResponse.grantAccess("PUBLIC");
                break;
        }

        // Compound policy support (BIZ-004): evaluate additional policies and combine results.
        // Example: SUBSCRIBERS + MEMBERS_ONLY means user must satisfy both.
        if (policy != null && policy.containsKey("additionalPolicies")) {
            @SuppressWarnings("unchecked")
            List<String> additional = (List<String>) policy.get("additionalPolicies");
            String combineMode = (String) policy.getOrDefault("combineMode", "AND");

            List<AccessCheckResponse> results = new ArrayList<>();
            results.add(primaryResult);

            for (String additionalPolicy : additional) {
                AccessCheckResponse additionalResult = evaluateAdditionalPolicy(
                        additionalPolicy, userId, policy, contentType, contentId);
                results.add(additionalResult);
            }

            return combineResults(results, combineMode);
        }

        return primaryResult;
    }

    /**
     * Evaluate a single additional policy by name.
     */
    private AccessCheckResponse evaluateAdditionalPolicy(String policyName, Long userId,
                                                          Map<String, Object> policy,
                                                          VideoAcl.ContentType contentType, Long contentId) {
        try {
            VideoAcl.DefaultPolicy additionalPolicy = VideoAcl.DefaultPolicy.valueOf(policyName);
            switch (additionalPolicy) {
                case SUBSCRIBERS:
                    if (userId == null) return AccessCheckResponse.denyAccess("AUTHENTICATION_REQUIRED");
                    return evaluateSubscriberAccess(userId);
                case MEMBERS_ONLY:
                    AccessCheckResponse cugResult = evaluateCugAccess(contentType, contentId);
                    if (cugResult != null) return cugResult;
                    return evaluateMembersOnlyAccess(userId, policy);
                case AUTHENTICATED:
                    if (userId != null) return AccessCheckResponse.grantAccess("AUTHENTICATED");
                    return AccessCheckResponse.denyAccess("AUTHENTICATION_REQUIRED");
                case PUBLIC:
                    return AccessCheckResponse.grantAccess("PUBLIC");
                case PRIVATE:
                    return AccessCheckResponse.denyAccess("PRIVATE_CONTENT");
                default:
                    return AccessCheckResponse.grantAccess("PUBLIC");
            }
        } catch (IllegalArgumentException e) {
            log.warn("Unknown additional policy: {}", policyName);
            return AccessCheckResponse.denyAccess("UNKNOWN_POLICY");
        }
    }

    /**
     * Combine multiple policy evaluation results.
     * AND mode: all must grant access. OR mode: any grant is sufficient.
     */
    private AccessCheckResponse combineResults(List<AccessCheckResponse> results, String combineMode) {
        if ("OR".equalsIgnoreCase(combineMode)) {
            // Any grant is sufficient
            for (AccessCheckResponse r : results) {
                if (r.isHasAccess()) return r;
            }
            // All denied — return the last denial reason
            return results.get(results.size() - 1);
        }

        // Default: AND mode — all must grant
        for (AccessCheckResponse r : results) {
            if (!r.isHasAccess()) return r;
        }
        // All granted — return the first grant reason (primary policy)
        return results.get(0);
    }

    /**
     * CUG access evaluation: for content owned by a CUG organization,
     * PUBLIC-visibility assets are allowed without membership (홍보용 promotional content).
     * Returns null if no CUG override applies (fall through to normal MEMBERS_ONLY check).
     */
    private AccessCheckResponse evaluateCugAccess(VideoAcl.ContentType contentType, Long contentId) {
        LiveAsset.OwnerType ownerType = null;
        Long ownerId = null;
        LiveAsset.Visibility assetVisibility = null;

        switch (contentType) {
            case LIVE -> {
                Optional<LiveAsset> live = liveAssetRepository.findById(contentId);
                if (live.isPresent()) {
                    ownerType = live.get().getOwnerType();
                    ownerId = live.get().getOwnerId();
                    assetVisibility = live.get().getVisibility();
                }
            }
            case VOD -> {
                Optional<VodAsset> vod = vodAssetRepository.findById(contentId);
                if (vod.isPresent()) {
                    ownerType = vod.get().getOwnerType();
                    ownerId = vod.get().getOwnerId();
                    assetVisibility = vod.get().getVisibility();
                }
            }
            case CLIP -> {
                Optional<ClipAsset> clip = clipAssetRepository.findById(contentId);
                if (clip.isPresent()) {
                    // ClipAsset does not have ownerType/ownerId; no CUG override
                    return null;
                }
            }
        }

        // Only applies to organization-owned content
        if (ownerType != LiveAsset.OwnerType.ORGANIZATION || ownerId == null) {
            return null;
        }

        Optional<Organization> orgOpt = organizationRepository.findById(ownerId);
        if (orgOpt.isEmpty() || !Boolean.TRUE.equals(orgOpt.get().getIsCug())) {
            return null;
        }

        // CUG org: PUBLIC visibility assets are promotional → grant access
        if (assetVisibility == LiveAsset.Visibility.PUBLIC) {
            return AccessCheckResponse.grantAccess("CUG_PROMOTIONAL");
        }

        // CUG org with MEMBERS_ONLY visibility → fall through to membership check
        return null;
    }

    /**
     * Evaluate subscriber access with circuit breaker resilience.
     * - Normal response: grant or deny based on subscription status.
     * - Cached fallback: grant access with SUBSCRIBER_CACHED reason (grace period).
     * - Service unavailable (no cache): grant temporary grace access instead of hard deny.
     */
    private AccessCheckResponse evaluateSubscriberAccess(Long userId) {
        EntitlementResult result = commerceEntitlementClient.checkSubscription(userId);

        if (result.isServiceUnavailable()) {
            // Commerce service is down and no cached result exists.
            // Grant temporary grace access so paid users are not blocked by an outage.
            log.warn("Commerce service unavailable for user {}. Granting grace access.", userId);
            return AccessCheckResponse.grantAccess("SUBSCRIBER_GRACE",
                    Map.of("degraded", true, "reason", "commerce_service_unavailable"));
        }

        if (result.isFromCache()) {
            log.info("Using cached subscription result for user {}", userId);
            CommerceEntitlementCheckResponse cached = result.getResponse().orElse(null);
            if (cached != null && cached.isHasAccess()) {
                return AccessCheckResponse.grantAccess("SUBSCRIBER_CACHED",
                        Map.of("degraded", true, "reason", "cached_result"));
            }
            // Cached result says no access — still deny
            return AccessCheckResponse.denyAccess("SUBSCRIPTION_REQUIRED");
        }

        // Normal (live) response
        if (result.getResponse().isEmpty()) {
            return AccessCheckResponse.denyAccess("SUBSCRIPTION_CHECK_UNAVAILABLE");
        }
        if (result.getResponse().get().isHasAccess()) {
            return AccessCheckResponse.grantAccess("SUBSCRIBER");
        }
        return AccessCheckResponse.denyAccess("SUBSCRIPTION_REQUIRED");
    }

    /**
     * BIZ-003/004: Unified "단체" membership check.
     *
     * Policy JSONB schema for MEMBERS_ONLY:
     * - "allowedGroups": [1, 2, 3]       (unified: covers both ORGANIZATION and TEAM targets)
     * - "allowedOrganizations": [1, 2]    (legacy fallback — treated as allowedGroups)
     * - "allowedTeams": [3]               (legacy fallback — treated as allowedGroups)
     * - "allowedRoles": ["MANAGER", "MEMBER"]  (role-level check within group membership)
     *
     * Hierarchical evaluation order:
     * 1. Role check — if allowedRoles is specified, match against user's active memberships
     * 2. Group check — unified query across ORGANIZATION + TEAM target types
     *    Organization-level membership is checked first (higher in hierarchy)
     */
    private AccessCheckResponse evaluateMembersOnlyAccess(Long userId, Map<String, Object> policy) {
        if (userId == null) {
            return AccessCheckResponse.denyAccess("AUTHENTICATION_REQUIRED");
        }

        if (policy == null) {
            return AccessCheckResponse.denyAccess("MEMBERS_ONLY");
        }

        // Single unified query: fetch all active+approved memberships for both ORGANIZATION and TEAM
        List<Membership> groupMemberships = membershipRepository
                .findByUserIdAndTargetTypeInAndActiveTrueAndApprovalStatus(
                        userId,
                        List.of(Membership.TargetType.ORGANIZATION, Membership.TargetType.TEAM),
                        Membership.ApprovalStatus.APPROVED);

        // 1. Check allowed roles (hierarchical: role within any active group membership)
        if (policy.containsKey("allowedRoles")) {
            @SuppressWarnings("unchecked")
            List<String> allowedRoles = (List<String>) policy.get("allowedRoles");
            for (Membership m : groupMemberships) {
                if (allowedRoles.contains(m.getRole().name())) {
                    return AccessCheckResponse.grantAccess("ROLE_MATCH");
                }
            }
        }

        // 2. Build unified allowed group IDs from new "allowedGroups" key
        //    with backward-compatible fallback to legacy "allowedOrganizations" + "allowedTeams"
        List<Long> allowedGroupIds = new ArrayList<>();

        if (policy.containsKey("allowedGroups")) {
            @SuppressWarnings("unchecked")
            List<Number> groups = (List<Number>) policy.get("allowedGroups");
            groups.forEach(id -> allowedGroupIds.add(id.longValue()));
        } else {
            // Legacy fallback: merge allowedOrganizations + allowedTeams into unified list
            if (policy.containsKey("allowedOrganizations")) {
                @SuppressWarnings("unchecked")
                List<Number> legacyOrgs = (List<Number>) policy.get("allowedOrganizations");
                legacyOrgs.forEach(id -> allowedGroupIds.add(id.longValue()));
            }
            if (policy.containsKey("allowedTeams")) {
                @SuppressWarnings("unchecked")
                List<Number> legacyTeams = (List<Number>) policy.get("allowedTeams");
                legacyTeams.forEach(id -> allowedGroupIds.add(id.longValue()));
            }
        }

        if (!allowedGroupIds.isEmpty()) {
            // Hierarchical: check Organization-level memberships first, then Team-level
            for (Membership m : groupMemberships) {
                if (m.getTargetType() == Membership.TargetType.ORGANIZATION
                        && allowedGroupIds.contains(m.getTargetId())) {
                    return AccessCheckResponse.grantAccess("GROUP_MEMBER");
                }
            }
            for (Membership m : groupMemberships) {
                if (m.getTargetType() == Membership.TargetType.TEAM
                        && allowedGroupIds.contains(m.getTargetId())) {
                    return AccessCheckResponse.grantAccess("GROUP_MEMBER");
                }
            }
        }

        return AccessCheckResponse.denyAccess("MEMBERS_ONLY");
    }

    @Transactional
    @CacheEvict(value = "acl", allEntries = true)
    public VideoAclResponse setAcl(String type, Long contentId, SetAclRequest request) {
        VideoAcl.ContentType contentType;
        try {
            contentType = VideoAcl.ContentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid content type: " + type);
        }

        VideoAcl.DefaultPolicy defaultPolicy;
        try {
            defaultPolicy = VideoAcl.DefaultPolicy.valueOf(request.getDefaultPolicy());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid default policy: " + request.getDefaultPolicy());
        }

        VideoAcl acl = videoAclRepository.findByContentTypeAndContentId(contentType, contentId)
                .orElse(null);

        if (acl == null) {
            acl = VideoAcl.builder()
                    .contentType(contentType)
                    .contentId(contentId)
                    .defaultPolicy(defaultPolicy)
                    .policy(request.getPolicy())
                    .build();
        } else {
            acl.updatePolicy(defaultPolicy, request.getPolicy());
        }

        VideoAcl saved = videoAclRepository.save(acl);
        return VideoAclResponse.from(saved);
    }

    public VideoAclResponse getAcl(String type, Long contentId) {
        VideoAcl.ContentType contentType;
        try {
            contentType = VideoAcl.ContentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid content type: " + type);
        }

        VideoAcl acl = videoAclRepository.findByContentTypeAndContentId(contentType, contentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "ACL not found for " + type + "/" + contentId));

        return VideoAclResponse.from(acl);
    }
}
