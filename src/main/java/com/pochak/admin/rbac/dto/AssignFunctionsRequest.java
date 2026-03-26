package com.pochak.admin.rbac.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignFunctionsRequest {

    @NotEmpty(message = "At least one function ID is required")
    private List<Long> functionIds;
}
