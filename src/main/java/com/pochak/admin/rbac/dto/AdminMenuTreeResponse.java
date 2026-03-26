package com.pochak.admin.rbac.dto;

import com.pochak.admin.rbac.entity.AdminMenu;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminMenuTreeResponse {

    private Long id;
    private String menuCode;
    private String menuName;
    private Long parentId;
    private String menuPath;
    private String iconName;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<AdminMenuTreeResponse> children;

    public static AdminMenuTreeResponse from(AdminMenu menu) {
        return AdminMenuTreeResponse.builder()
                .id(menu.getId())
                .menuCode(menu.getMenuCode())
                .menuName(menu.getMenuName())
                .parentId(menu.getParent() != null ? menu.getParent().getId() : null)
                .menuPath(menu.getMenuPath())
                .iconName(menu.getIconName())
                .sortOrder(menu.getSortOrder())
                .isActive(menu.getIsActive())
                .createdAt(menu.getCreatedAt())
                .build();
    }

    public static AdminMenuTreeResponse fromWithChildren(AdminMenu menu, List<AdminMenuTreeResponse> children) {
        return AdminMenuTreeResponse.builder()
                .id(menu.getId())
                .menuCode(menu.getMenuCode())
                .menuName(menu.getMenuName())
                .parentId(menu.getParent() != null ? menu.getParent().getId() : null)
                .menuPath(menu.getMenuPath())
                .iconName(menu.getIconName())
                .sortOrder(menu.getSortOrder())
                .isActive(menu.getIsActive())
                .createdAt(menu.getCreatedAt())
                .children(children)
                .build();
    }
}
