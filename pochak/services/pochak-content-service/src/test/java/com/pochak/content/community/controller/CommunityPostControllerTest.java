package com.pochak.content.community.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.community.dto.CommunityPostResponse;
import com.pochak.content.community.dto.CreateCommunityPostRequest;
import com.pochak.content.community.entity.CommunityPost;
import com.pochak.content.community.service.CommunityPostService;
import com.pochak.content.community.service.ModerationService;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CommunityPostControllerTest {

    @Mock
    private CommunityPostService communityPostService;

    @Mock
    private ModerationService moderationService;

    @InjectMocks
    private CommunityPostController communityPostController;

    @Test
    @DisplayName("GET /communities/posts - should return post list")
    void listPosts_success() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        CommunityPostResponse post = CommunityPostResponse.builder()
                .id(1L)
                .title("Test Post")
                .postType(CommunityPost.PostType.NEWS)
                .createdAt(LocalDateTime.now())
                .build();
        Page<CommunityPostResponse> page = new PageImpl<>(List.of(post), pageable, 1);

        given(communityPostService.listPosts(isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        ApiResponse<List<CommunityPostResponse>> result =
                communityPostController.listPosts(null, null, null, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getTitle()).isEqualTo("Test Post");
        assertThat(result.getMeta()).isNotNull();
        assertThat(result.getMeta().getTotalCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("POST /communities/posts - should create post (201)")
    void createPost_success() {
        // given
        Long userId = 1L;
        CreateCommunityPostRequest request = CreateCommunityPostRequest.builder()
                .postType(CommunityPost.PostType.NEWS)
                .title("New Post")
                .body("Body content")
                .build();

        CommunityPostResponse response = CommunityPostResponse.builder()
                .id(1L)
                .authorUserId(userId)
                .title("New Post")
                .postType(CommunityPost.PostType.NEWS)
                .createdAt(LocalDateTime.now())
                .build();

        given(communityPostService.createPost(eq(userId), eq(request))).willReturn(response);

        // when
        ApiResponse<CommunityPostResponse> result =
                communityPostController.createPost(userId, request);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().getId()).isEqualTo(1L);
        assertThat(result.getData().getTitle()).isEqualTo("New Post");
        verify(communityPostService).createPost(eq(userId), eq(request));
    }

    @Test
    @DisplayName("GET /communities/posts/{id} - should return single post")
    void getPost_success() {
        // given
        CommunityPostResponse post = CommunityPostResponse.builder()
                .id(1L)
                .title("Existing Post")
                .build();
        given(communityPostService.getPost(1L)).willReturn(post);

        // when
        ApiResponse<CommunityPostResponse> result = communityPostController.getPost(1L);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().getTitle()).isEqualTo("Existing Post");
    }

    @Test
    @DisplayName("DELETE /communities/posts/{id} - should delete post")
    void deletePost_success() {
        // when
        ApiResponse<Void> result = communityPostController.deletePost(1L, 1L, "USER");

        // then
        assertThat(result.isSuccess()).isTrue();
        verify(communityPostService).deletePost(1L, 1L, "USER");
    }
}
