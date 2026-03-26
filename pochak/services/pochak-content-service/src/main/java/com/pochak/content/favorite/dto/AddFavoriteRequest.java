package com.pochak.content.favorite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddFavoriteRequest {

    @NotBlank(message = "contentType is required")
    private String contentType;

    @NotNull(message = "contentId is required")
    private Long contentId;
}
