package com.pochak.admin.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminLoginResponse {

    private String accessToken;
    private String refreshToken;
    private String adminName;
    private Long adminUserId;
    private List<String> roles;
    private List<String> permissions;
}
