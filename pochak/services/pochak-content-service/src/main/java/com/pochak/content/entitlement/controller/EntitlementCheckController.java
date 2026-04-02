package com.pochak.content.entitlement.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.acl.dto.SetAclRequest;
import com.pochak.content.acl.dto.VideoAclResponse;
import com.pochak.content.acl.service.VideoAclService;
import com.pochak.content.entitlement.dto.AccessCheckResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contents")
@RequiredArgsConstructor
public class EntitlementCheckController {

    private final VideoAclService videoAclService;

    /**
     * Evaluate access for a content item based on ACL rules and user memberships.
     */
    @GetMapping("/{type}/{id}/access")
    public ApiResponse<AccessCheckResponse> checkAccess(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        AccessCheckResponse response = videoAclService.evaluateAccess(type, id, userId);
        return ApiResponse.success(response);
    }

    /**
     * Set or update ACL policy for a content item.
     */
    @PostMapping("/{type}/{id}/acl")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VideoAclResponse> setAcl(
            @PathVariable String type,
            @PathVariable Long id,
            @Valid @RequestBody SetAclRequest request) {
        return ApiResponse.success(videoAclService.setAcl(type, id, request));
    }

    /**
     * Get current ACL for a content item.
     */
    @GetMapping("/{type}/{id}/acl")
    public ApiResponse<VideoAclResponse> getAcl(
            @PathVariable String type,
            @PathVariable Long id) {
        return ApiResponse.success(videoAclService.getAcl(type, id));
    }
}
