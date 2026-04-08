package com.pochak.admin.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Admin2faRequiredResponse {

    private String timeKey;
    private String maskedPhone;
    private String message;
}
