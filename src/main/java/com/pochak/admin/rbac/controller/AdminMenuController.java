package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.AdminMenuTreeResponse;
import com.pochak.admin.rbac.dto.CreateMenuRequest;
import com.pochak.admin.rbac.dto.ReorderMenuRequest;
import com.pochak.admin.rbac.dto.UpdateMenuRequest;
import com.pochak.admin.rbac.service.AdminMenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/admin/api/v1/rbac/menus")
@RequiredArgsConstructor
public class AdminMenuController {

    private final AdminMenuService adminMenuService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminMenuTreeResponse>>> getMenuTree() {
        return ResponseEntity.ok(ApiResponse.ok(adminMenuService.getMenuTree()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminMenuTreeResponse>> getMenu(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminMenuService.getMenuDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminMenuTreeResponse>> createMenu(
            @Valid @RequestBody CreateMenuRequest request) {
        AdminMenuTreeResponse menu = adminMenuService.createMenu(request);
        return ResponseEntity
                .created(URI.create("/admin/api/v1/rbac/menus/" + menu.getId()))
                .body(ApiResponse.ok(menu, "Menu created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminMenuTreeResponse>> updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMenuRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminMenuService.updateMenu(id, request), "Menu updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMenu(@PathVariable Long id) {
        adminMenuService.deleteMenu(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderMenus(@Valid @RequestBody ReorderMenuRequest request) {
        adminMenuService.reorderMenus(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Menus reordered successfully"));
    }
}
