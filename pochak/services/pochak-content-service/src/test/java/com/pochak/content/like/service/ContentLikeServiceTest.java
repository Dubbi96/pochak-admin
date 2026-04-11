package com.pochak.content.like.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.like.dto.LikeCountResponse;
import com.pochak.content.like.entity.ContentLike;
import com.pochak.content.like.repository.ContentLikeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class ContentLikeServiceTest {

    @Mock
    private ContentLikeRepository contentLikeRepository;

    @InjectMocks
    private ContentLikeService contentLikeService;

    @Test
    @DisplayName("Should create a new like when toggling and like does not exist")
    void testToggleLikeCreatesNew() {
        // given
        given(contentLikeRepository.findByUserIdAndContentTypeAndContentId(1L, "VOD", 10L))
                .willReturn(Optional.empty());

        // when
        contentLikeService.toggleLike(1L, "VOD", 10L);

        // then
        then(contentLikeRepository).should().save(any(ContentLike.class));
    }

    @Test
    @DisplayName("Should delete existing like when toggling and like exists")
    void testToggleLikeDeletesExisting() {
        // given
        ContentLike existing = ContentLike.builder()
                .id(1L).userId(1L).contentType("VOD").contentId(10L).build();

        given(contentLikeRepository.findByUserIdAndContentTypeAndContentId(1L, "VOD", 10L))
                .willReturn(Optional.of(existing));

        // when
        contentLikeService.toggleLike(1L, "VOD", 10L);

        // then
        then(contentLikeRepository).should().delete(existing);
    }

    @Test
    @DisplayName("Should remove like successfully")
    void testRemoveLike() {
        // given
        ContentLike like = ContentLike.builder()
                .id(1L).userId(1L).contentType("VOD").contentId(10L).build();

        given(contentLikeRepository.findByUserIdAndContentTypeAndContentId(1L, "VOD", 10L))
                .willReturn(Optional.of(like));

        // when
        contentLikeService.removeLike(1L, "VOD", 10L);

        // then
        then(contentLikeRepository).should().delete(like);
    }

    @Test
    @DisplayName("Should throw exception when removing non-existent like")
    void testRemoveLikeNotFound() {
        // given
        given(contentLikeRepository.findByUserIdAndContentTypeAndContentId(1L, "VOD", 10L))
                .willReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> contentLikeService.removeLike(1L, "VOD", 10L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Like not found");
    }

    @Test
    @DisplayName("Should return like count and user like status")
    void testGetLikeCount() {
        // given
        given(contentLikeRepository.countByContentTypeAndContentId("VOD", 10L)).willReturn(42L);
        given(contentLikeRepository.existsByUserIdAndContentTypeAndContentId(1L, "VOD", 10L)).willReturn(true);

        // when
        LikeCountResponse response = contentLikeService.getLikeCount(1L, "VOD", 10L);

        // then
        assertThat(response.getContentType()).isEqualTo("VOD");
        assertThat(response.getContentId()).isEqualTo(10L);
        assertThat(response.getLikeCount()).isEqualTo(42);
        assertThat(response.isLiked()).isTrue();
    }

    @Test
    @DisplayName("Should return isLiked false when user has not liked")
    void testGetLikeCountNotLiked() {
        // given
        given(contentLikeRepository.countByContentTypeAndContentId("CLIP", 5L)).willReturn(10L);
        given(contentLikeRepository.existsByUserIdAndContentTypeAndContentId(2L, "CLIP", 5L)).willReturn(false);

        // when
        LikeCountResponse response = contentLikeService.getLikeCount(2L, "CLIP", 5L);

        // then
        assertThat(response.getLikeCount()).isEqualTo(10);
        assertThat(response.isLiked()).isFalse();
    }
}
