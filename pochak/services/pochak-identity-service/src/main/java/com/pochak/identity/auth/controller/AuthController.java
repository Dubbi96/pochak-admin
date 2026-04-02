package com.pochak.identity.auth.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.identity.auth.dto.*;
import com.pochak.identity.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * @deprecated Use SignupController POST /auth/signup instead.
     * Kept temporarily for backward compatibility.
     */
    @Deprecated
    @PostMapping("/signup/legacy")
    public ApiResponse<TokenResponse> signUpLegacy(@Valid @RequestBody SignUpRequest request) {
        return ApiResponse.success(authService.signUp(request));
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> signIn(@Valid @RequestBody SignInRequest request) {
        return ApiResponse.success(authService.signIn(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@RequestBody java.util.Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new com.pochak.common.exception.BusinessException(
                    com.pochak.common.exception.ErrorCode.INVALID_INPUT, "refreshToken is required");
        }
        return ApiResponse.success(authService.refresh(refreshToken));
    }

    @PostMapping("/social")
    public ApiResponse<TokenResponse> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        return ApiResponse.success(authService.socialLogin(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader("X-User-Id") Long userId) {
        authService.logout(userId);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/withdraw")
    public ApiResponse<Void> withdraw(@RequestHeader("X-User-Id") Long userId) {
        authService.withdraw(userId);
        return ApiResponse.success(null);
    }
}
