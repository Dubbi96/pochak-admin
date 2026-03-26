package com.pochak.content.comment.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.comment.dto.*;
import com.pochak.content.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * List top-level comments for a content item.
     * GET /contents/{type}/{id}/comments?page=0
     */
    @GetMapping("/contents/{type}/{id}/comments")
    public ApiResponse<List<CommentResponse>> listComments(
            @PathVariable String type,
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<CommentResponse> page = commentService.listComments(type, id, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    /**
     * Add a comment to a content item.
     * POST /contents/{type}/{id}/comments
     */
    @PostMapping("/contents/{type}/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommentResponse> addComment(
            @PathVariable String type,
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request) {
        return ApiResponse.success(commentService.addComment(type, id, request));
    }

    /**
     * Delete own comment.
     * DELETE /comments/{id}?userId=
     */
    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteComment(
            @PathVariable Long id,
            @RequestParam Long userId) {
        commentService.deleteComment(id, userId);
        return ApiResponse.success(null);
    }

    /**
     * Get replies to a specific comment.
     * GET /comments/{id}/replies
     */
    @GetMapping("/comments/{id}/replies")
    public ApiResponse<List<CommentResponse>> getReplies(@PathVariable Long id) {
        return ApiResponse.success(commentService.getReplies(id));
    }
}
