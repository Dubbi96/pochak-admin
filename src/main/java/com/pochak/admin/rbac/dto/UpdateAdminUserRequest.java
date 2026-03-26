package com.pochak.admin.rbac.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAdminUserRequest {

    private String name;
    private String email;
    private String phone;
    private String password;
}
