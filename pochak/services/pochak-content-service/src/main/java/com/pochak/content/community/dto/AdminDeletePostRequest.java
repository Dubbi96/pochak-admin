package com.pochak.content.community.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminDeletePostRequest {

    @NotBlank(message = "reason is required")
    private String reason;
}
