package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.AdminUserListResponse;
import com.pochak.admin.rbac.dto.CreateAdminUserRequest;
import com.pochak.admin.rbac.dto.UpdateAdminUserRequest;
import com.pochak.admin.rbac.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/admin/api/v1/rbac/members")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserListResponse>>> getUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.getActiveUsers(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserListResponse>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.getUserDetail(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminUserListResponse>> createUser(
            @Valid @RequestBody CreateAdminUserRequest request) {
        AdminUserListResponse user = adminUserService.createUser(request);
        return ResponseEntity
                .created(URI.create("/admin/api/v1/rbac/members/" + user.getId()))
                .body(ApiResponse.ok(user, "Member created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserListResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.updateUser(id, request), "Member updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<ApiResponse<AdminUserListResponse>> blockUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.blockUser(id), "Member blocked successfully"));
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<ApiResponse<AdminUserListResponse>> unblockUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.unblockUser(id), "Member unblocked successfully"));
    }
}
