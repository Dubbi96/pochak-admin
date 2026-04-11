package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.web.bff.client.IdentityServiceClient;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class WebAuthController {

    private final IdentityServiceClient identityClient;

    @Value("${pochak.cookie.secure:true}")
    private boolean secureCookie;

    @Value("${pochak.cookie.domain:}")
    private String cookieDomain;

    @GetMapping("/oauth2/start/{provider}")
    public ResponseEntity<JsonNode> startOAuth2(@PathVariable String provider) {
        log.debug("Starting OAuth2 flow for provider: {} (platform=web)", provider);
        JsonNode result = identityClient.startOAuth2(provider, "web");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, Object> loginRequest,
            HttpServletResponse response) {
        JsonNode result = identityClient.login(loginRequest);
        return handleTokenResponse(result, response);
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(
            @RequestBody Map<String, Object> signupRequest,
            HttpServletResponse response) {
        JsonNode result = identityClient.signup(signupRequest);
        return handleTokenResponse(result, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        clearTokenCookies(response);
        return ResponseEntity.ok().build();
    }

    private ResponseEntity<Map<String, Object>> handleTokenResponse(
            JsonNode result, HttpServletResponse response) {
        JsonNode data = result.has("data") ? result.get("data") : result;

        String accessToken = getTextOrNull(data, "accessToken");
        String refreshToken = getTextOrNull(data, "refreshToken");
        long expiresIn = data.has("expiresIn") ? data.get("expiresIn").asLong() : 1800;

        if (accessToken != null) {
            addHttpOnlyCookie(response, "pochak_at", accessToken, (int) expiresIn);
        }
        if (refreshToken != null) {
            addHttpOnlyCookie(response, "pochak_rt", refreshToken, 30 * 24 * 60 * 60);
        }

        return ResponseEntity.ok(Map.of("authenticated", true, "expiresIn", expiresIn));
    }

    private void addHttpOnlyCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookie.setDomain(cookieDomain);
        }
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void clearTokenCookies(HttpServletResponse response) {
        for (String name : new String[]{"pochak_at", "pochak_rt"}) {
            Cookie cookie = new Cookie(name, "");
            cookie.setHttpOnly(true);
            cookie.setSecure(secureCookie);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            if (cookieDomain != null && !cookieDomain.isBlank()) {
                cookie.setDomain(cookieDomain);
            }
            cookie.setAttribute("SameSite", "Lax");
            response.addCookie(cookie);
        }
    }

    private String getTextOrNull(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asText() : null;
    }
}
