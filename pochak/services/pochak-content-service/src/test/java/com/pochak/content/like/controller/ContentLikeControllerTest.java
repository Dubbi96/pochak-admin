package com.pochak.content.like.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.like.dto.LikeCountResponse;
import com.pochak.content.like.service.ContentLikeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ContentLikeControllerTest {

    @Mock
    private ContentLikeService contentLikeService;

    @InjectMocks
    private ContentLikeController contentLikeController;

    @Test
    @DisplayName("POST /contents/{type}/{id}/like - should toggle like")
    void toggleLike_success() {
        // when
        ApiResponse<Void> result = contentLikeController.toggleLike(1L, "vod", 10L);

        // then
        assertThat(result.isSuccess()).isTrue();
        verify(contentLikeService).toggleLike(1L, "vod", 10L);
    }

    @Test
    @DisplayName("DELETE /contents/{type}/{id}/like - should remove like")
    void removeLike_success() {
        // when
        ApiResponse<Void> result = contentLikeController.removeLike(1L, "vod", 10L);

        // then
        assertThat(result.isSuccess()).isTrue();
        verify(contentLikeService).removeLike(1L, "vod", 10L);
    }

    @Test
    @DisplayName("GET /contents/{type}/{id}/like-count - should return like count")
    void getLikeCount_success() {
        // given
        LikeCountResponse likeCount = LikeCountResponse.builder()
                .contentType("vod")
                .contentId(10L)
                .likeCount(42)
                .isLiked(true)
                .build();
        given(contentLikeService.getLikeCount(1L, "vod", 10L)).willReturn(likeCount);

        // when
        ApiResponse<LikeCountResponse> result = contentLikeController.getLikeCount(1L, "vod", 10L);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().getLikeCount()).isEqualTo(42);
        assertThat(result.getData().isLiked()).isTrue();
    }

    @Test
    @DisplayName("POST /contents/{type}/{id}/like - should work for clip type")
    void toggleLike_clipType() {
        // when
        ApiResponse<Void> result = contentLikeController.toggleLike(2L, "clip", 20L);

        // then
        assertThat(result.isSuccess()).isTrue();
        verify(contentLikeService).toggleLike(2L, "clip", 20L);
    }
}
