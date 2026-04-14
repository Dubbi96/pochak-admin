package com.pochak.content.community.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.community.dto.*;
import com.pochak.content.community.entity.ModerationStatus;
import com.pochak.content.community.repository.PostReportRepository;
import com.pochak.content.community.service.CommunityPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 전용 커뮤니티 게시글 관리 API (항목 30).
 * Gateway 레벨에서 ADMIN 역할 검증이 이루어지므로 컨트롤러 내 역할 체크는 생략.
 */
@RestController
@RequestMapping("/admin/community")
@RequiredArgsConstructor
public class CommunityAdminController {

    private final CommunityPostService communityPostService;
    private final PostReportRepository postReportRepository;

    /**
     * 전체 게시글 목록 조회 (삭제된 게시글 포함).
     * GET /admin/community/posts?status=PENDING&keyword=test&organizationId=1
     */
    @GetMapping("/posts")
    public ApiResponse<List<CommunityPostResponse>> listPosts(
            @RequestParam(required = false) ModerationStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long organizationId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<CommunityPostResponse> page =
                communityPostService.findAllForAdmin(status, keyword, organizationId, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    /**
     * 게시글 상태 변경 (APPROVED / PENDING / REJECTED).
     * PATCH /admin/community/posts/{id}/status
     */
    @PatchMapping("/posts/{id}/status")
    public ApiResponse<CommunityPostResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdatePostStatusRequest request) {

        CommunityPostResponse response =
                communityPostService.updateStatus(id, request.getStatus(), request.getReason());
        return ApiResponse.success(response);
    }

    /**
     * 게시글 강제 삭제 (reason 필수).
     * DELETE /admin/community/posts/{id}?reason=스팸%20게시물
     */
    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deletePost(
            @PathVariable Long id,
            @RequestParam String reason) {

        communityPostService.adminDelete(id, reason);
        return ApiResponse.success(null);
    }

    /**
     * 게시글에 달린 신고 목록 조회.
     * GET /admin/community/posts/{id}/reports
     */
    @GetMapping("/posts/{id}/reports")
    public ApiResponse<List<PostReportResponse>> getReports(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {

        List<PostReportResponse> reports = postReportRepository.findByPostId(id)
                .stream()
                .map(PostReportResponse::from)
                .toList();

        return ApiResponse.success(reports);
    }
}
