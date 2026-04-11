package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.IdentityServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AppAuthController {

    private final IdentityServiceClient identityClient;

    @GetMapping("/oauth2/start/{provider}")
    public ResponseEntity<JsonNode> startOAuth2Pkce(
            @PathVariable String provider,
            @RequestParam("code_challenge") String codeChallenge,
            @RequestParam(value = "code_challenge_method", defaultValue = "S256") String codeChallengeMethod) {

        log.debug("Starting OAuth2 PKCE flow for provider: {} (platform=mobile)", provider);
        JsonNode result = identityClient.startOAuth2Pkce(provider, codeChallenge, codeChallengeMethod);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/signup/minor")
    public ResponseEntity<JsonNode> signupMinor(
            @RequestBody Map<String, Object> signupRequest,
            @RequestHeader("Authorization") String guardianAuth) {

        log.debug("Processing minor signup with guardian token");
        String guardianToken = guardianAuth.replace("Bearer ", "");
        JsonNode result = identityClient.signupMinor(signupRequest, guardianToken);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/guardian/verify")
    public ResponseEntity<JsonNode> verifyGuardian(@RequestParam("token") String token) {
        log.debug("Verifying guardian token");
        JsonNode result = identityClient.verifyGuardian(token);
        return ResponseEntity.ok(result);
    }
}
