package com.pochak.content.follow.dto;

import com.pochak.content.follow.entity.Follow;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowResponse {

    private Long id;
    private Long followerUserId;
    private String targetType;
    private Long targetId;
    private LocalDateTime createdAt;

    public static FollowResponse from(Follow follow) {
        return FollowResponse.builder()
                .id(follow.getId())
                .followerUserId(follow.getFollowerUserId())
                .targetType(follow.getTargetType().name())
                .targetId(follow.getTargetId())
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
