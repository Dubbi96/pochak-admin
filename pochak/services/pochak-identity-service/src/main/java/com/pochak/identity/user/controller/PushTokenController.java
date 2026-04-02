package com.pochak.identity.user.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.identity.user.dto.DeletePushTokenRequest;
import com.pochak.identity.user.dto.PushTokenResponse;
import com.pochak.identity.user.dto.RegisterPushTokenRequest;
import com.pochak.identity.user.service.PushTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/me/push-tokens")
@RequiredArgsConstructor
public class PushTokenController {

    private final PushTokenService pushTokenService;

    @PostMapping
    public ApiResponse<PushTokenResponse> registerPushToken(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody RegisterPushTokenRequest request) {
        return ApiResponse.success(pushTokenService.register(userId, request));
    }

    @DeleteMapping
    public ApiResponse<Void> deletePushToken(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody DeletePushTokenRequest request) {
        pushTokenService.delete(userId, request.getPushToken());
        return ApiResponse.success(null);
    }
}
