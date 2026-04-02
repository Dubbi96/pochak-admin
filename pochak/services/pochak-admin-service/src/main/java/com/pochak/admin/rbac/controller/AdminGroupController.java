package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.*;
import com.pochak.admin.rbac.service.AdminGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/admin/api/v1/rbac/groups")
@RequiredArgsConstructor
public class AdminGroupController {

    private final AdminGroupService adminGroupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminGroupTreeResponse>>> getGroupTree() {
        return ResponseEntity.ok(ApiResponse.ok(adminGroupService.getGroupTree()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminGroupTreeResponse>> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminGroupService.getGroupDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminGroupTreeResponse>> createGroup(
            @Valid @RequestBody CreateGroupRequest request) {
        AdminGroupTreeResponse group = adminGroupService.createGroup(request);
        return ResponseEntity
                .created(URI.create("/admin/api/v1/rbac/groups/" + group.getId()))
                .body(ApiResponse.ok(group, "Group created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminGroupTreeResponse>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGroupRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminGroupService.updateGroup(id, request), "Group updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable Long id) {
        adminGroupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<Void>> assignMembers(
            @PathVariable Long id,
            @Valid @RequestBody AssignMembersRequest request) {
        adminGroupService.assignMembers(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Members assigned successfully"));
    }

    @DeleteMapping("/{id}/members")
    public ResponseEntity<ApiResponse<Void>> removeMembers(
            @PathVariable Long id,
            @Valid @RequestBody AssignMembersRequest request) {
        adminGroupService.removeMembers(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Members removed successfully"));
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<Void>> assignRoles(
            @PathVariable Long id,
            @Valid @RequestBody AssignRolesRequest request) {
        adminGroupService.assignRoles(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Roles assigned successfully"));
    }

    @DeleteMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<Void>> removeRoles(
            @PathVariable Long id,
            @Valid @RequestBody AssignRolesRequest request) {
        adminGroupService.removeRoles(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Roles removed successfully"));
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<ApiResponse<List<String>>> getEffectivePermissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminGroupService.getEffectivePermissions(id)));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<AdminUserListResponse>>> getGroupMembers(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminGroupService.getGroupMembers(id)));
    }

    @GetMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<List<AdminRoleResponse>>> getGroupRoles(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminGroupService.getGroupRoles(id)));
    }
}
