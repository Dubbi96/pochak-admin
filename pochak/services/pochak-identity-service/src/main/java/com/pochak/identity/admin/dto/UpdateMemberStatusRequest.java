package com.pochak.identity.admin.dto;

import lombok.Getter;

@Getter
public class UpdateMemberStatusRequest {
    private String status; // ACTIVE, INACTIVE, SUSPENDED, WITHDRAWN
}
