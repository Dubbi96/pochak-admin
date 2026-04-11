package com.pochak.partner.bff.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/partner")
@RequiredArgsConstructor
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
