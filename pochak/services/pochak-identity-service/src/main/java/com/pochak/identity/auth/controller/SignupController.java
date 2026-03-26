package com.pochak.identity.auth.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.identity.auth.dto.*;
import com.pochak.identity.auth.service.GuardianVerificationService;
import com.pochak.identity.auth.service.PhoneVerificationService;
import com.pochak.identity.auth.service.SignupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class SignupController {

    private final SignupService signupService;
    private final PhoneVerificationService phoneVerificationService;
    private final GuardianVerificationService guardianVerificationService;

    // ===== Signup Routes =====

    /**
     * Route A: Domestic adult (14+) signup
     */
    @PostMapping("/signup")
    public ApiResponse<TokenResponse> signupDomestic(@Valid @RequestBody DomesticSignupRequest request) {
        return ApiResponse.success(signupService.signupDomestic(request));
    }

    /**
     * Route B: Domestic minor (under 14) signup with guardian consent
     */
    @PostMapping("/signup/minor")
    public ApiResponse<TokenResponse> signupMinor(@Valid @RequestBody MinorSignupRequest request) {
        return ApiResponse.success(signupService.signupMinor(request));
    }

    /**
     * Route C: Social (SNS) signup
     */
    @PostMapping("/signup/social")
    public ApiResponse<TokenResponse> signupSocial(@Valid @RequestBody SocialSignupRequest request) {
        return ApiResponse.success(signupService.signupSocial(request));
    }

    /**
     * Route D: Foreign user signup
     */
    @PostMapping("/signup/foreign")
    public ApiResponse<TokenResponse> signupForeign(@Valid @RequestBody ForeignSignupRequest request) {
        return ApiResponse.success(signupService.signupForeign(request));
    }

    // ===== Phone Verification =====

    /**
     * Send phone verification code (mock: logs to console)
     */
    @PostMapping("/phone/send-code")
    public ApiResponse<Map<String, Object>> sendPhoneCode(
            @Valid @RequestBody PhoneVerificationRequest request) {
        return ApiResponse.success(
                phoneVerificationService.sendVerificationCode(request.getPhone(), request.getPurpose()));
    }

    /**
     * Verify phone code and get verified_token
     */
    @PostMapping("/phone/verify-code")
    public ApiResponse<Map<String, Object>> verifyPhoneCode(
            @Valid @RequestBody PhoneVerifyCodeRequest request) {
        return ApiResponse.success(
                phoneVerificationService.verifyCode(request.getPhone(), request.getCode(), request.getPurpose()));
    }

    /**
     * Check if phone is already registered
     */
    @GetMapping("/phone/check")
    public ApiResponse<Map<String, Object>> checkPhoneRegistration(@RequestParam String phone) {
        return ApiResponse.success(phoneVerificationService.checkPhoneRegistration(phone));
    }

    // ===== Guardian Verification =====

    /**
     * Verify guardian (for minor signup flow).
     * The guardian must have already verified their phone.
     */
    @PostMapping("/guardian/verify")
    public ApiResponse<Map<String, Object>> verifyGuardian(
            @RequestParam String guardianVerifiedToken) {
        return ApiResponse.success(guardianVerificationService.verifyGuardian(guardianVerifiedToken));
    }

    // ===== Duplicate Check =====

    /**
     * Check duplicate for loginId, email, phone fields
     */
    @GetMapping("/check-duplicate")
    public ApiResponse<CheckDuplicateResponse> checkDuplicate(
            @RequestParam(required = false) String loginId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        return ApiResponse.success(signupService.checkDuplicate(loginId, email, phone));
    }
}
