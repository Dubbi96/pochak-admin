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
public class CreateMenuRequest {

    @NotBlank(message = "Menu code is required")
    private String menuCode;

    @NotBlank(message = "Menu name is required")
    private String menuName;

    private Long parentId;

    private String menuPath;

    private String iconName;

    private Integer sortOrder;
}
