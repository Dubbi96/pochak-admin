package com.pochak.operation.notification.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.operation.notification.dto.NotificationPreferenceRequest;
import com.pochak.operation.notification.dto.NotificationPreferenceResponse;
import com.pochak.operation.notification.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recording-notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping
    public ApiResponse<NotificationPreferenceResponse> getPreference(
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(preferenceService.getPreference(userId));
    }

    @PutMapping
    public ApiResponse<NotificationPreferenceResponse> updatePreference(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody NotificationPreferenceRequest request) {
        return ApiResponse.success(preferenceService.updatePreference(userId, request));
    }
}
