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
public class AssignMembersRequest {

    @NotEmpty(message = "At least one member ID is required")
    private List<Long> memberIds;
}
