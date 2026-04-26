package com.pochak.admin.organization.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.organization.client.OrganizationVerifyResponse;
import com.pochak.admin.organization.service.AdminOrganizationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin API for organization management.
 */
@RestController
@RequestMapping("/admin/api/v1/organizations")
@RequiredArgsConstructor
public class AdminOrganizationController {

    private final AdminOrganizationService adminOrganizationService;

    /**
     * List organizations proxied from Content Service.
     * GET /admin/api/v1/organizations
     * (reached via gateway: GET /api/v1/admin/organizations → /admin/api/v1/organizations)
     */
    @GetMapping
    public ResponseEntity<?> listOrganizations(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String accessType,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        JsonNode result = adminOrganizationService.listOrganizations(type, accessType, searchKeyword, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * Get single organization by ID proxied from Content Service.
     * GET /admin/api/v1/organizations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrganization(@PathVariable Long id) {
        JsonNode result = adminOrganizationService.getOrganization(id);
        return ResponseEntity.ok(result);
    }

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
