package com.pochak.admin.rbac.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMenuRequest {

    private String menuName;
    private String menuPath;
    private String iconName;
    private Integer sortOrder;
}
