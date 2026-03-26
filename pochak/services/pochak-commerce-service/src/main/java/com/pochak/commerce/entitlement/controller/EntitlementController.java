package com.pochak.commerce.entitlement.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.entitlement.dto.EntitlementCheckResponse;
import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.service.EntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/entitlements")
@RequiredArgsConstructor
public class EntitlementController {

    private final EntitlementService entitlementService;

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<EntitlementCheckResponse>> checkEntitlement(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) EntitlementType type,
            @RequestParam(required = false) String scopeType,
            @RequestParam(required = false) Long scopeId) {
        EntitlementCheckResponse response;
        if (type != null) {
            response = entitlementService.checkEntitlement(userId, type, scopeType, scopeId);
        } else {
            response = entitlementService.checkAccess(userId, scopeType, scopeId);
        }
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EntitlementResponse>>> getEntitlements(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(entitlementService.getActiveEntitlements(userId)));
    }
}
