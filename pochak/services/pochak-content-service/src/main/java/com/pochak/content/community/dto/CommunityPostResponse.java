package com.pochak.content.community.dto;

import com.pochak.content.community.entity.CommunityPost;
import com.pochak.content.community.entity.ModerationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityPostResponse {

    private Long id;
    private Long organizationId;
    private Long authorUserId;
    private CommunityPost.PostType postType;
    private String title;
    private String body;
    private String imageUrls;
    private String siGunGuCode;
    private Boolean isPinned;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private ModerationStatus moderationStatus;
    private Integer warningCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommunityPostResponse from(CommunityPost post) {
        return CommunityPostResponse.builder()
                .id(post.getId())
                .organizationId(post.getOrganizationId())
                .authorUserId(post.getAuthorUserId())
                .postType(post.getPostType())
                .title(post.getTitle())
                .body(post.getBody())
                .imageUrls(post.getImageUrls())
                .siGunGuCode(post.getSiGunGuCode())
                .isPinned(post.getIsPinned())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .moderationStatus(post.getModerationStatus())
                .warningCount(post.getWarningCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
