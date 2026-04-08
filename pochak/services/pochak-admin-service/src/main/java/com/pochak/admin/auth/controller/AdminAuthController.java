package com.pochak.admin.auth.controller;

import com.pochak.admin.auth.dto.Admin2faRequiredResponse;
import com.pochak.admin.auth.dto.Admin2faVerifyRequest;
import com.pochak.admin.auth.dto.AdminLoginRequest;
import com.pochak.admin.auth.dto.AdminLoginResponse;
import com.pochak.admin.auth.service.AdminAuthService;
import com.pochak.admin.auth.service.AdminSms2faService;
import com.pochak.admin.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/v1/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AdminSms2faService adminSms2faService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Admin2faRequiredResponse>> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminAuthService.loginPhase1(request), "2FA verification required"));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<ApiResponse<AdminLoginResponse>> verify2fa(@Valid @RequestBody Admin2faVerifyRequest request) {
        Long adminUserId = adminSms2faService.verifyCode(request.getTimeKey(), request.getCode());
        AdminLoginResponse response = adminAuthService.loginPhase2Complete(adminUserId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }
}
