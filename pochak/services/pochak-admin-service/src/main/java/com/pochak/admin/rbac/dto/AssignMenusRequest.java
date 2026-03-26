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
public class AssignMenusRequest {

    @NotEmpty(message = "At least one menu ID is required")
    private List<Long> menuIds;
}
