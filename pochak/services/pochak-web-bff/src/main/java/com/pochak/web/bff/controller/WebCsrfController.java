package com.pochak.web.bff.controller;

import com.pochak.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
public class WebCsrfController {

    @GetMapping("/csrf/token")
    public ApiResponse<Map<String, String>> getCsrfToken() {
        String token = UUID.randomUUID().toString();
        return ApiResponse.success(Map.of("token", token));
    }
}
