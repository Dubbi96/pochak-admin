package com.pochak.content.club.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateClubPostRequest {

    private String title;
    private String content;
    private String imageUrls;
}
