package com.pochak.content.community.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.community.dto.*;
import com.pochak.content.community.entity.CommunityPost;
import com.pochak.content.community.entity.ModerationAction;
import com.pochak.content.community.entity.PostReport;
import com.pochak.content.community.service.CommunityPostService;
import com.pochak.content.community.service.ModerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/communities")
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;
    private final ModerationService moderationService;

    /**
     * List community posts with optional filters.
     * GET /communities/posts?postType=NEWS&siGunGuCode=11010&organizationId=1&page=0
     */
    @GetMapping("/posts")
    public ApiResponse<List<CommunityPostResponse>> listPosts(
            @RequestParam(required = false) CommunityPost.PostType postType,
            @RequestParam(required = false) String siGunGuCode,
            @RequestParam(required = false) Long organizationId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<CommunityPostResponse> page = communityPostService.listPosts(
                postType, siGunGuCode, organizationId, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    /**
     * Get a single community post.
     * GET /communities/posts/{id}
     */
    @GetMapping("/posts/{id}")
    public ApiResponse<CommunityPostResponse> getPost(@PathVariable Long id) {
        return ApiResponse.success(communityPostService.getPost(id));
    }

    /**
     * Create a community post.
     * POST /communities/posts
     */
    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommunityPostResponse> createPost(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateCommunityPostRequest request) {
        return ApiResponse.success(communityPostService.createPost(userId, request));
    }

    /**
     * Update a community post.
     * PUT /communities/posts/{id}
     */
    @PutMapping("/posts/{id}")
    public ApiResponse<CommunityPostResponse> updatePost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateCommunityPostRequest request) {
        return ApiResponse.success(communityPostService.updatePost(id, userId, request));
    }

    /**
     * Delete a community post (soft delete).
     * DELETE /communities/posts/{id}
     */
    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deletePost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        communityPostService.deletePost(id, userId);
        return ApiResponse.success(null);
    }

    /**
     * Pin a community post (MANAGER only).
     * PUT /communities/posts/{id}/pin
     */
    @PutMapping("/posts/{id}/pin")
    public ApiResponse<Void> pinPost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        communityPostService.pinPost(id, userId);
        return ApiResponse.success(null);
    }

    /**
     * Unpin a community post (MANAGER only).
     * PUT /communities/posts/{id}/unpin
     */
    @PutMapping("/posts/{id}/unpin")
    public ApiResponse<Void> unpinPost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        communityPostService.unpinPost(id, userId);
        return ApiResponse.success(null);
    }

    // ──────────────────────────────────────────────
    // Moderation endpoints
    // ──────────────────────────────────────────────

    /**
     * Report a community post.
     * POST /communities/posts/{id}/report
     */
    @PostMapping("/posts/{id}/report")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostReportResponse> reportPost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ReportPostRequest request) {
        PostReport report = moderationService.reportPost(id, userId, request.getCategory(), request.getReason());
        return ApiResponse.success(PostReportResponse.from(report));
    }

    /**
     * Get pending reports for an organization (moderator only).
     * GET /communities/moderation/pending?organizationId=1
     */
    @GetMapping("/moderation/pending")
    public ApiResponse<List<PostReportResponse>> getPendingReports(
            @RequestParam Long organizationId,
            @RequestHeader("X-User-Id") Long userId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<PostReport> page = moderationService.getPendingReports(organizationId, userId, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        List<PostReportResponse> content = page.getContent().stream()
                .map(PostReportResponse::from)
                .toList();

        return ApiResponse.success(content, meta);
    }

    /**
     * Resolve a report (moderator only).
     * POST /communities/moderation/reports/{id}/resolve
     */
    @PostMapping("/moderation/reports/{id}/resolve")
    public ApiResponse<PostReportResponse> resolveReport(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ResolveReportRequest request) {
        PostReport resolved = moderationService.resolveReport(id, userId, request.getResolution(), request.getNote());
        return ApiResponse.success(PostReportResponse.from(resolved));
    }

    /**
     * Take moderation action on a post (moderator only).
     * POST /communities/moderation/posts/{id}/action
     */
    @PostMapping("/moderation/posts/{id}/action")
    public ApiResponse<ModerationActionResponse> takeAction(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ModerationActionRequest request) {
        ModerationAction action = moderationService.takeAction(
                id, userId, request.getActionType(), request.getReason());
        return ApiResponse.success(ModerationActionResponse.from(action));
    }
}
