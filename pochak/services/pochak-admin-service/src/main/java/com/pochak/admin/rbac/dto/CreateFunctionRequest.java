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
public class CreateFunctionRequest {

    @NotBlank(message = "Function code is required")
    private String functionCode;

    @NotBlank(message = "Function name is required")
    private String functionName;

    private String httpMethod;

    private String apiPath;

    private String description;
}
