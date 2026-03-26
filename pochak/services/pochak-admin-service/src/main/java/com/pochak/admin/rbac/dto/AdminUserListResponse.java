package com.pochak.admin.rbac.dto;

import com.pochak.admin.rbac.entity.AdminUser;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserListResponse {

    private Long id;
    private String loginId;
    private String name;
    private String phone;
    private String email;
    private LocalDateTime lastLoginAt;
    private Boolean isBlocked;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static AdminUserListResponse from(AdminUser user) {
        return AdminUserListResponse.builder()
                .id(user.getId())
                .loginId(user.getLoginId())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .lastLoginAt(user.getLastLoginAt())
                .isBlocked(user.getIsBlocked())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
