package com.pochak.partner.bff.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Partner auth/profile endpoints. Identity-service does not yet expose
 * {@code /api/v1/partners/me} or {@code /api/v1/partners/register}; these return 501 until implemented.
 */
@RestController
@RequestMapping("/api/v1/partner")
public class PartnerAuthController {

    private static final String NOT_IMPLEMENTED_JSON =
            "{\"success\":false,\"code\":\"NOT_IMPLEMENTED\",\"message\":\"Partner profile APIs are not implemented in identity-service yet\"}";

    @GetMapping("/me")
    public ResponseEntity<String> getMyPartnerInfo() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(NOT_IMPLEMENTED_JSON);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody(required = false) String body) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(NOT_IMPLEMENTED_JSON);
    }
}
