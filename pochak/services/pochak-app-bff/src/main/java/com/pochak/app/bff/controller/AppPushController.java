package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.IdentityServiceClient;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/push")
@RequiredArgsConstructor
public class AppPushController {

    private final IdentityServiceClient identityClient;

    @PostMapping("/register")
    public ResponseEntity<JsonNode> registerPushToken(@RequestBody Map<String, Object> pushRequest) {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        log.debug("Registering push token for userId={}", userId);
        JsonNode result = identityClient.registerPushToken(userId, pushRequest);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/unregister")
    public ResponseEntity<JsonNode> unregisterPushToken(@RequestBody Map<String, Object> body) {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        log.debug("Unregistering push token for userId={}", userId);
        JsonNode result = identityClient.unregisterPushToken(userId, body);
        return ResponseEntity.ok(result);
    }
}
