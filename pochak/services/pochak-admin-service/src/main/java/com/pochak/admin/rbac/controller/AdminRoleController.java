package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.*;
import com.pochak.admin.rbac.service.AdminRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/admin/api/v1/rbac/roles")
@RequiredArgsConstructor
public class AdminRoleController {

    private final AdminRoleService adminRoleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminRoleResponse>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.ok(adminRoleService.getActiveRoleResponses()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRoleResponse>> getRole(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminRoleService.getRoleDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminRoleResponse>> createRole(
            @Valid @RequestBody CreateRoleRequest request) {
        AdminRoleResponse role = adminRoleService.createRole(request);
        return ResponseEntity
                .created(URI.create("/admin/api/v1/rbac/roles/" + role.getId()))
                .body(ApiResponse.ok(role, "Role created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRoleResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminRoleService.updateRole(id, request), "Role updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        adminRoleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PutMapping("/{id}/menus")
    public ResponseEntity<ApiResponse<Void>> assignMenus(
            @PathVariable Long id,
            @Valid @RequestBody AssignMenusRequest request) {
        adminRoleService.assignMenus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Menus assigned successfully"));
    }

    @PutMapping("/{id}/functions")
    public ResponseEntity<ApiResponse<Void>> assignFunctions(
            @PathVariable Long id,
            @Valid @RequestBody AssignFunctionsRequest request) {
        adminRoleService.assignFunctions(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Functions assigned successfully"));
    }

    @GetMapping("/{id}/menus")
    public ResponseEntity<ApiResponse<List<AdminMenuTreeResponse>>> getRoleMenuTree(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminRoleService.getRoleMenuTree(id)));
    }

    @GetMapping("/{id}/functions")
    public ResponseEntity<ApiResponse<List<AdminFunctionResponse>>> getRoleFunctions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminRoleService.getRoleFunctions(id)));
    }
}
