package com.pochak.admin.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class Admin2faVerifyRequest {

    @NotBlank
    private String timeKey;

    @NotBlank
    private String code;
}
