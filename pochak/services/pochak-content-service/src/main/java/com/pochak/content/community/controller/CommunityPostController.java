package com.pochak.content.community.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.community.dto.*;
import com.pochak.content.community.entity.CommunityPost;
import com.pochak.content.community.service.CommunityPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/communities/posts")
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;

    /**
     * List community posts with optional filters.
     * GET /communities/posts?postType=NEWS&siGunGuCode=11010&organizationId=1&page=0
     */
    @GetMapping
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
    @GetMapping("/{id}")
    public ApiResponse<CommunityPostResponse> getPost(@PathVariable Long id) {
        return ApiResponse.success(communityPostService.getPost(id));
    }

    /**
     * Create a community post.
     * POST /communities/posts
     */
    @PostMapping
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
    @PutMapping("/{id}")
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
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deletePost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        communityPostService.deletePost(id, userId, userRole);
        return ApiResponse.success(null);
    }

    /**
     * Pin a community post (MANAGER only).
     * PUT /communities/posts/{id}/pin
     */
    @PutMapping("/{id}/pin")
    public ApiResponse<Void> pinPost(@PathVariable Long id) {
        communityPostService.pinPost(id);
        return ApiResponse.success(null);
    }

    /**
     * Unpin a community post.
     * PUT /communities/posts/{id}/unpin
     */
    @PutMapping("/{id}/unpin")
    public ApiResponse<Void> unpinPost(@PathVariable Long id) {
        communityPostService.unpinPost(id);
        return ApiResponse.success(null);
    }

    /**
     * Report a community post (stub).
     * POST /communities/posts/{id}/report
     */
    @PostMapping("/{id}/report")
    public ApiResponse<Void> reportPost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        // TODO: Implement reporting logic
        return ApiResponse.success(null);
    }
}
