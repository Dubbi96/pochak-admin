package com.pochak.admin.rbac.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderMenuRequest {

    @NotNull(message = "Menu order list is required")
    private List<MenuOrderItem> items;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MenuOrderItem {
        private Long menuId;
        private Integer sortOrder;
    }
}
