package com.pochak.admin.rbac.dto;

import com.pochak.admin.rbac.entity.AdminRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminRoleResponse {

    private Long id;
    private String roleCode;
    private String roleName;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<AdminMenuTreeResponse> menus;
    private List<AdminFunctionResponse> functions;

    public static AdminRoleResponse from(AdminRole role) {
        return AdminRoleResponse.builder()
                .id(role.getId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .createdAt(role.getCreatedAt())
                .build();
    }

    public static AdminRoleResponse from(AdminRole role, List<AdminMenuTreeResponse> menus, List<AdminFunctionResponse> functions) {
        return AdminRoleResponse.builder()
                .id(role.getId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .createdAt(role.getCreatedAt())
                .menus(menus)
                .functions(functions)
                .build();
    }
}
