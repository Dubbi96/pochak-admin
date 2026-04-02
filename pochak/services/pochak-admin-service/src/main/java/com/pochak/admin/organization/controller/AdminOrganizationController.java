package com.pochak.admin.organization.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.organization.client.OrganizationVerifyResponse;
import com.pochak.admin.organization.service.AdminOrganizationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * M9: Admin API for organization management, including is_verified toggle.
 */
@RestController
@RequestMapping("/admin/api/v1/organizations")
@RequiredArgsConstructor
public class AdminOrganizationController {

    private final AdminOrganizationService adminOrganizationService;

    /**
     * Toggle the is_verified status of an organization.
     * PUT /admin/api/v1/organizations/{id}/verify
     */
    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<OrganizationVerifyResponse>> toggleVerification(
            @PathVariable Long id,
            @RequestAttribute(value = "adminUserId", required = false) Long adminUserId,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");

        OrganizationVerifyResponse response = adminOrganizationService.toggleVerification(
                id, adminUserId, ipAddress, userAgent);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
