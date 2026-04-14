package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

/**
 * Partner auth/profile endpoints.
 * Proxies to identity-service: partners are users with role=PARTNER.
 */
@RestController
@RequestMapping("/api/v1/partner")
@RequiredArgsConstructor
public class PartnerAuthController {

    private final RestClient identityClient;

    /**
     * 파트너 본인 프로필 조회
     * GET /api/v1/partner/me → identity-service GET /users/me
     */
    @GetMapping("/me")
    public String getMyPartnerInfo(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return identityClient.get()
                .uri("/users/me")
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    /**
     * 파트너 계정 등록 (이메일/패스워드 기반 가입)
     * POST /api/v1/partner/register → identity-service POST /auth/signup
     * 가입 후 관리자가 role을 PARTNER로 승격해야 함
     */
    @PostMapping("/register")
    public String register(@RequestBody(required = false) String body) {
        return identityClient.post()
                .uri("/auth/signup")
                .header("Content-Type", "application/json")
                .body(body != null ? body : "{}")
                .retrieve()
                .body(String.class);
    }
}
