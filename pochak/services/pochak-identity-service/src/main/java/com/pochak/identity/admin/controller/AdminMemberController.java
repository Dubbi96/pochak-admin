package com.pochak.identity.admin.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.identity.admin.dto.AdminMemberListResponse;
import com.pochak.identity.admin.dto.AdminMemberResponse;
import com.pochak.identity.admin.dto.UpdateMemberRoleRequest;
import com.pochak.identity.admin.dto.UpdateMemberStatusRequest;
import com.pochak.identity.admin.service.AdminMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

    @GetMapping
    public ApiResponse<AdminMemberListResponse> getMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String searchType) {
        return ApiResponse.success(
                adminMemberService.getMembers(page, size, status, role, search, searchType));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminMemberResponse> getMember(@PathVariable Long id) {
        return ApiResponse.success(adminMemberService.getMember(id));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<AdminMemberResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateMemberStatusRequest request) {
        return ApiResponse.success(adminMemberService.updateStatus(id, request));
    }

    @PutMapping("/{id}/role")
    public ApiResponse<AdminMemberResponse> updateRole(
            @PathVariable Long id,
            @RequestBody UpdateMemberRoleRequest request) {
        return ApiResponse.success(adminMemberService.updateRole(id, request));
    }
}
