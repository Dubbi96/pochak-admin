package com.pochak.content.follow.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowCountResponse {

    private String targetType;
    private Long targetId;
    private Long followerCount;
}
