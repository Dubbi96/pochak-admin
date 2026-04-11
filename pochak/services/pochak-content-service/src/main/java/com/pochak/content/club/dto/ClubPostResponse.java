package com.pochak.content.club.dto;

import com.pochak.content.club.entity.ClubPost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubPostResponse {

    private Long id;
    private Long clubId;
    private Long authorUserId;
    private String postType;
    private String title;
    private String content;
    private String imageUrls;
    private Boolean pinned;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ClubPostResponse from(ClubPost post) {
        return ClubPostResponse.builder()
                .id(post.getId())
                .clubId(post.getClubId())
                .authorUserId(post.getAuthorUserId())
                .postType(post.getPostType().name())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrls(post.getImageUrls())
                .pinned(post.getPinned())
                .viewCount(post.getViewCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
