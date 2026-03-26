package com.pochak.content.community.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.community.entity.*;
import com.pochak.content.community.repository.CommunityPostRepository;
import com.pochak.content.community.repository.ModerationActionRepository;
import com.pochak.content.community.repository.PostReportRepository;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModerationService {

    private final PostReportRepository postReportRepository;
    private final ModerationActionRepository moderationActionRepository;
    private final CommunityPostRepository communityPostRepository;
    private final MembershipRepository membershipRepository;
    private final AiModerationClient aiModerationClient;

    /**
     * Report a post.
     */
    @Transactional
    public PostReport reportPost(Long postId, Long reporterUserId, ReportCategory category, String reason) {
        CommunityPost post = findActivePost(postId);

        if (post.isOwnedBy(reporterUserId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Cannot report your own post");
        }

        PostReport report = PostReport.builder()
                .postId(postId)
                .reporterUserId(reporterUserId)
                .category(category)
                .reason(reason)
                .build();

        return postReportRepository.save(report);
    }

    /**
     * Get reports for a post (moderator only).
     */
    public List<PostReport> getReports(Long postId, Long moderatorUserId) {
        CommunityPost post = findActivePost(postId);
        assertModerator(moderatorUserId, post.getOrganizationId());
        return postReportRepository.findByPostId(postId);
    }

    /**
     * Get pending reports for an organization.
     */
    public Page<PostReport> getPendingReports(Long organizationId, Long moderatorUserId, Pageable pageable) {
        assertModerator(moderatorUserId, organizationId);
        return postReportRepository.findPendingByOrganization(ModerationStatus.PENDING, organizationId, pageable);
    }

    /**
     * Resolve a report (moderator action).
     */
    @Transactional
    public PostReport resolveReport(Long reportId, Long moderatorUserId, ModerationStatus resolution, String note) {
        PostReport report = postReportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Report not found: " + reportId));

        CommunityPost post = findActivePost(report.getPostId());
        assertModerator(moderatorUserId, post.getOrganizationId());

        report.resolve(moderatorUserId, resolution, note);
        return report;
    }

    /**
     * Take moderation action on a post (delete, warn, hide, restore).
     */
    @Transactional
    public ModerationAction takeAction(Long postId, Long moderatorUserId,
                                        ModerationAction.ActionType actionType, String reason) {
        CommunityPost post = findActivePost(postId);
        assertModerator(moderatorUserId, post.getOrganizationId());

        ModerationAction action = ModerationAction.builder()
                .postId(postId)
                .moderatorUserId(moderatorUserId)
                .actionType(actionType)
                .reason(reason)
                .build();

        // Apply the action to the post
        switch (actionType) {
            case DELETE -> post.softDelete();
            case HIDE -> post.setModerationStatus(ModerationStatus.REJECTED);
            case RESTORE -> post.setModerationStatus(ModerationStatus.APPROVED);
            case WARN -> {
                post.incrementWarningCount();
                log.info("Warning issued for post {} (total warnings: {})", postId, post.getWarningCount());
            }
        }

        return moderationActionRepository.save(action);
    }

    /**
     * Determine if a new post needs pre-moderation (hybrid approach).
     * Users who have received warnings go through pre-moderation.
     */
    public boolean requiresPreModeration(Long authorUserId) {
        // Check if the author has any posts that received warnings
        // A simple heuristic: if any of the author's posts have warning_count > 0
        List<CommunityPost> authorPosts = communityPostRepository.findByAuthorUserIdAndWarningCountGreaterThan(
                authorUserId, 0);
        return !authorPosts.isEmpty();
    }

    /**
     * Run AI moderation analysis on content.
     */
    public AiModerationClient.ModerationResult analyzeContent(String title, String body) {
        return aiModerationClient.analyze(title, body);
    }

    /**
     * Assert that the user is a moderator (ADMIN or MANAGER) for the given organization.
     */
    private void assertModerator(Long userId, Long organizationId) {
        if (!isModerator(userId, organizationId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "User " + userId + " is not a moderator for organization " + organizationId);
        }
    }

    /**
     * Check if user is a moderator for the post's organization.
     * A moderator is a user with ADMIN or MANAGER role in the organization membership.
     */
    private boolean isModerator(Long userId, Long organizationId) {
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
