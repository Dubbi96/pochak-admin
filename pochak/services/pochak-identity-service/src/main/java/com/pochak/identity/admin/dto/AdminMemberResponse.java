package com.pochak.identity.admin.dto;

import com.pochak.identity.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminMemberResponse {
    private Long id;
    private String email;
    private String nickname;
    private String name;
    private String phoneNumber;
    private String role;
    private String status;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    public static AdminMemberResponse from(User user) {
        return AdminMemberResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .status(user.getStatus() != null ? user.getStatus().name() : "ACTIVE")
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
