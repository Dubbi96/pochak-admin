package com.pochak.content.sharing.dto;

import com.pochak.content.sharing.entity.Share;
import com.pochak.content.sharing.entity.SharePlatform;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ShareResponse {

    private Long id;
    private Long contentId;
    private String contentType;
    private Long userId;
    private SharePlatform platform;
    private LocalDateTime createdAt;

    public static ShareResponse from(Share share) {
        return ShareResponse.builder()
                .id(share.getId())
                .contentId(share.getContentId())
                .contentType(share.getContentType())
                .userId(share.getUserId())
                .platform(share.getPlatform())
                .createdAt(share.getCreatedAt())
                .build();
    }
}
