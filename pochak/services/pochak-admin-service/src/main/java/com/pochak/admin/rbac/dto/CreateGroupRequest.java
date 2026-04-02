package com.pochak.admin.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateGroupRequest {

    @NotBlank(message = "Group code is required")
    private String groupCode;

    @NotBlank(message = "Group name is required")
    private String groupName;

    private Long parentId;

    private String description;
}
