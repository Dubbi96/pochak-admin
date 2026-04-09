package com.pochak.content.club.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateMemberRoleRequest {

    @NotBlank
    private String role;
}
