package com.pochak.admin.rbac.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminGroupTreeResponse {

    private Long id;
    private String groupCode;
    private String groupName;
    private Long parentId;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<AdminGroupTreeResponse> children;
}
