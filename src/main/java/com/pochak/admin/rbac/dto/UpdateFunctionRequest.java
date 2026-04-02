package com.pochak.admin.rbac.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFunctionRequest {

    private String functionName;
    private String httpMethod;
    private String apiPath;
    private String description;
}
