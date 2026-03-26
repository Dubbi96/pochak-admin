package com.pochak.content.community.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCommunityPostRequest {

    private String title;

    private String body;

    private String imageUrls;
}
