package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner")
@RequiredArgsConstructor
public class PartnerAuthController {

    private final RestClient identityClient;

    @GetMapping("/me")
    public String getMyPartnerInfo(@RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return identityClient.get()
                .uri("/api/v1/partners/me")
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    @PostMapping("/register")
    public String register(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestBody String body) {
        return identityClient.post()
                .uri("/api/v1/partners/register")
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }
}
