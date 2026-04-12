package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.ContentServiceClient;
import com.pochak.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AppResolveController {

    private final ContentServiceClient contentClient;

    @GetMapping("/resolve/{identifier}")
    public ApiResponse<JsonNode> resolve(@PathVariable String identifier) {
        log.debug("App resolving identifier: {}", identifier);
        return ApiResponse.success(contentClient.resolveSlug(identifier));
    }

    @GetMapping("/qr/{identifier}")
    public ApiResponse<JsonNode> qrResolve(@PathVariable String identifier) {
        log.debug("App QR resolving: {}", identifier);
        return ApiResponse.success(contentClient.resolveSlug(identifier));
    }
}
