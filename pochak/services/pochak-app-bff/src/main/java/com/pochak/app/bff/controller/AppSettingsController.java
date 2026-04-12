package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.IdentityServiceClient;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AppSettingsController {

    private final IdentityServiceClient identityClient;

    @GetMapping("/settings/push-preferences")
    public ResponseEntity<JsonNode> getPushPreferences() {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(identityClient.getPushPreferences(userId));
    }

    @PatchMapping("/settings/push-preferences/{category}")
    public ResponseEntity<JsonNode> togglePushPreference(
            @PathVariable String category,
            @RequestBody Map<String, Object> body) {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(identityClient.togglePushPreference(userId, category, body));
    }

    @GetMapping("/settings/sessions")
    public ResponseEntity<JsonNode> getSessions() {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(identityClient.getMySessions(userId));
    }

    @DeleteMapping("/settings/sessions/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeSession(@PathVariable Long sessionId) {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) throw new IllegalStateException("Unauthorized");
        identityClient.revokeSession(userId, sessionId);
    }
}
