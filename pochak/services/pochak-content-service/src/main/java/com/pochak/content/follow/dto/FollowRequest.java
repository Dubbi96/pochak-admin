package com.pochak.content.follow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowRequest {

    @NotNull
    private Long followerUserId;

    @NotNull
    private String targetType; // USER, TEAM, CLUB, ORGANIZATION

    @NotNull
    private Long targetId;
}
