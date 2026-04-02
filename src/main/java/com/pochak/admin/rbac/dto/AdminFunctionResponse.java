package com.pochak.admin.rbac.dto;

import com.pochak.admin.rbac.entity.AdminFunction;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminFunctionResponse {

    private Long id;
    private String functionCode;
    private String functionName;
    private String httpMethod;
    private String apiPath;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static AdminFunctionResponse from(AdminFunction function) {
        return AdminFunctionResponse.builder()
                .id(function.getId())
                .functionCode(function.getFunctionCode())
                .functionName(function.getFunctionName())
                .httpMethod(function.getHttpMethod())
                .apiPath(function.getApiPath())
                .description(function.getDescription())
                .isActive(function.getIsActive())
                .createdAt(function.getCreatedAt())
                .build();
    }
}
