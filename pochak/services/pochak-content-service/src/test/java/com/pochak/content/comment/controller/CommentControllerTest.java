package com.pochak.content.comment.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.comment.dto.CommentResponse;
import com.pochak.content.comment.dto.CreateCommentRequest;
import com.pochak.content.comment.service.CommentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CommentControllerTest {

    @Mock
    private CommentService commentService;

    @InjectMocks
    private CommentController commentController;

    @Test
    @DisplayName("GET /contents/{type}/{id}/comments - should return comment list with page meta")
    void listComments_success() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        CommentResponse comment = CommentResponse.builder()
                .id(1L)
                .contentId(10L)
                .contentType("vod")
                .userId(1L)
                .body("Great content!")
                .createdAt(LocalDateTime.now())
                .build();
        Page<CommentResponse> page = new PageImpl<>(List.of(comment), pageable, 1);

        given(commentService.listComments("vod", 10L, pageable)).willReturn(page);

        // when
        ApiResponse<List<CommentResponse>> result =
                commentController.listComments("vod", 10L, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getBody()).isEqualTo("Great content!");
        assertThat(result.getMeta()).isNotNull();
        assertThat(result.getMeta().getTotalCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("GET /contents/{type}/{id}/comments - should return empty list")
    void listComments_empty() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<CommentResponse> page = new PageImpl<>(List.of(), pageable, 0);

        given(commentService.listComments("vod", 10L, pageable)).willReturn(page);

        // when
        ApiResponse<List<CommentResponse>> result =
                commentController.listComments("vod", 10L, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isEmpty();
    }

    @Test
    @DisplayName("POST /contents/{type}/{id}/comments - should add comment (201)")
    void addComment_success() {
        // given
        CreateCommentRequest request = CreateCommentRequest.builder()
                .userId(1L)
                .body("Nice goal!")
                .build();
        CommentResponse response = CommentResponse.builder()
                .id(1L)
                .contentId(10L)
                .contentType("vod")
                .userId(1L)
                .body("Nice goal!")
                .createdAt(LocalDateTime.now())
                .build();

        given(commentService.addComment("vod", 10L, request)).willReturn(response);

        // when
        ApiResponse<CommentResponse> result = commentController.addComment("vod", 10L, request);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().getBody()).isEqualTo("Nice goal!");
    }

    @Test
    @DisplayName("DELETE /comments/{id} - should delete comment")
    void deleteComment_success() {
        // when
        ApiResponse<Void> result = commentController.deleteComment(1L, 1L);

        // then
        assertThat(result.isSuccess()).isTrue();
        verify(commentService).deleteComment(1L, 1L);
    }

    @Test
    @DisplayName("GET /comments/{id}/replies - should return replies")
    void getReplies_success() {
        // given
        CommentResponse reply = CommentResponse.builder()
                .id(2L)
                .parentId(1L)
                .body("I agree!")
                .build();
        given(commentService.getReplies(1L)).willReturn(List.of(reply));

        // when
        ApiResponse<List<CommentResponse>> result = commentController.getReplies(1L);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getParentId()).isEqualTo(1L);
    }
}
