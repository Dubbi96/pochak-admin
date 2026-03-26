package com.pochak.content.highlight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateHighlightRequest {

    @NotNull
    private Integer startTimeSeconds;

    @NotNull
    private Integer endTimeSeconds;

    @NotBlank
    private String highlightType;

    private String description;
}
