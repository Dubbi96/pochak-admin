package com.pochak.content.like.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LikeCountResponse {

    private String contentType;
    private Long contentId;
    private long likeCount;
    private boolean isLiked;
}
