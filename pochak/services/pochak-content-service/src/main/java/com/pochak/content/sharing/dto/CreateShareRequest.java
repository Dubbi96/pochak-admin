package com.pochak.content.sharing.dto;

import com.pochak.content.sharing.entity.SharePlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShareRequest {

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotNull(message = "Platform is required")
    private SharePlatform platform;
}
