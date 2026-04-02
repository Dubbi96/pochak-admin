package com.pochak.identity.user.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.identity.user.dto.*;
import com.pochak.identity.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(userService.getProfile(userId));
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userService.updateProfile(userId, request));
    }

    @GetMapping("/me/preferences")
    public ApiResponse<UserPreferencesResponse> getMyPreferences(
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(userService.getPreferences(userId));
    }

    @PutMapping("/me/preferences")
    public ApiResponse<UserPreferencesResponse> updateMyPreferences(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        return ApiResponse.success(userService.updatePreferences(userId, request));
    }

    @GetMapping("/me/status")
    public ApiResponse<UserStatusResponse> getMyStatus(
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(userService.getUserStatus(userId));
    }
}
