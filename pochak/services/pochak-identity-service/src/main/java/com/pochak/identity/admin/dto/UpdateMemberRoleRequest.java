package com.pochak.identity.admin.dto;

import lombok.Getter;

@Getter
public class UpdateMemberRoleRequest {
    private String role; // USER, MANAGER, ADMIN
}
