package com.pochak.content.community.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.community.dto.*;
import com.pochak.content.community.entity.CommunityPost;
import com.pochak.content.community.entity.ModerationStatus;
import com.pochak.content.community.repository.CommunityPostRepository;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityPostService {

    private final CommunityPostRepository communityPostRepository;
    private final ModerationService moderationService;
    private final MembershipRepository membershipRepository;

    /**
     * List posts with optional filters.
     */
    public Page<CommunityPostResponse> listPosts(CommunityPost.PostType postType,
                                                  String siGunGuCode,
                                                  Long organizationId,
                                                  Pageable pageable) {
        return communityPostRepository
                .findWithFilters(postType, siGunGuCode, organizationId, pageable)
                .map(CommunityPostResponse::from);
    }

    /**
     * Get a single post by ID.
     */
    public CommunityPostResponse getPost(Long id) {
        CommunityPost post = findActivePost(id);
        return CommunityPostResponse.from(post);
    }

    /**
     * Create a new community post.
     */
    @Transactional
    public CommunityPostResponse createPost(Long userId, CreateCommunityPostRequest request) {
        // Determine moderation status: pre-moderation for warned users, post-moderation otherwise
        ModerationStatus initialStatus = moderationService.requiresPreModeration(userId)
                ? ModerationStatus.PENDING
                : ModerationStatus.APPROVED;

        CommunityPost post = CommunityPost.builder()
                .organizationId(request.getOrganizationId())
                .authorUserId(userId)
                .postType(request.getPostType())
                .title(request.getTitle())
                .body(request.getBody())
                .imageUrls(request.getImageUrls())
                .siGunGuCode(request.getSiGunGuCode())
                .moderationStatus(initialStatus)
                .build();

        // Run AI moderation analysis asynchronously for flagging
        AiModerationClient.ModerationResult aiResult =
                moderationService.analyzeContent(request.getTitle(), request.getBody());
        if (aiResult.toxicityScore() > 0.7) {
            post.flagByAi(aiResult.summary());
            log.info("Post by user {} auto-flagged by AI: {}", userId, aiResult.summary());
        }

        CommunityPost saved = communityPostRepository.save(post);
        return CommunityPostResponse.from(saved);
    }

    /**
     * Update an existing post. Only the author can update.
     */
    @Transactional
    public CommunityPostResponse updatePost(Long id, Long userId, UpdateCommunityPostRequest request) {
        CommunityPost post = findActivePost(id);

        if (!post.isOwnedBy(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only the author can update this post");
        }

        post.update(request.getTitle(), request.getBody(), request.getImageUrls());
        return CommunityPostResponse.from(post);
    }

    /**
     * Soft-delete a post. Author or organization ADMIN/MANAGER can delete.
     * BIZ-006: Validates moderator role against the post's organization membership, not X-User-Role header.
     */
    @Transactional
    public void deletePost(Long id, Long userId) {
        CommunityPost post = findActivePost(id);

        if (!post.isOwnedBy(userId) && !isOrgModerator(userId, post.getOrganizationId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only the author or an organization manager can delete this post");
        }

        post.softDelete();
    }

    /**
     * Pin a post. Only organization ADMIN/MANAGER can pin.
     * BIZ-006: Validates moderator role against the post's organization.
     */
    @Transactional
    public void pinPost(Long id, Long userId) {
        CommunityPost post = findActivePost(id);
        if (!isOrgModerator(userId, post.getOrganizationId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Only an organization manager can pin posts");
        }
        post.pin();
    }

    /**
     * Unpin a post. Only organization ADMIN/MANAGER can unpin.
     * BIZ-006: Validates moderator role against the post's organization.
     */
    @Transactional
    public void unpinPost(Long id, Long userId) {
        CommunityPost post = findActivePost(id);
        if (!isOrgModerator(userId, post.getOrganizationId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Only an organization manager can unpin posts");
        }
        post.unpin();
    }

    /**
     * Check if user is ADMIN or MANAGER of the given organization.
     */
    private boolean isOrgModerator(Long userId, Long organizationId) {
        return membershipRepository
                .findByUserIdAndTargetTypeAndTargetIdAndActiveTrue(
                        userId, Membership.TargetType.ORGANIZATION, organizationId)
                .map(m -> m.getRole() == Membership.MembershipRole.ADMIN
                        || m.getRole() == Membership.MembershipRole.MANAGER)
                .orElse(false);
    }

    private CommunityPost findActivePost(Long id) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Community post not found: " + id));

        if (post.isDeleted()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Community post not found: " + id);
        }

        return post;
    }
}
