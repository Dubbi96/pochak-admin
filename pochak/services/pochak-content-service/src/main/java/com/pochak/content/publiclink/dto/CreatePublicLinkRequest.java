package com.pochak.content.publiclink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreatePublicLinkRequest {

    @NotBlank
    @Pattern(regexp = "^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$",
            message = "Slug must be 3-100 chars, lowercase alphanumeric and hyphens only")
    private String slug;

    @NotNull
    private String resourceType;

    @NotNull
    private Long resourceId;
}
