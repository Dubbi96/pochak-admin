package com.pochak.content.sharing.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ShareInfoResponse {

    private Long contentId;
    private String contentType;
    private String title;
    private String description;
    private String thumbnailUrl;
    private long shareCount;
}
