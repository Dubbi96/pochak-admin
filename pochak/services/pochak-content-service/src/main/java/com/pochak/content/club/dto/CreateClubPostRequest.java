package com.pochak.content.club.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateClubPostRequest {

    @NotNull
    private Long authorUserId;

    private String postType;

    @NotBlank
    private String title;

    private String content;

    private String imageUrls;
}
