package com.pochak.content.community.dto;

import com.pochak.content.community.entity.CommunityPost;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommunityPostRequest {

    private Long organizationId;

    @NotNull
    private CommunityPost.PostType postType;

    @NotBlank
    private String title;

    private String body;

    private String imageUrls;

    private String siGunGuCode;
}
