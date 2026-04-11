package com.pochak.web.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdentityServiceClient {

    private final RestClient identityClient;

    public JsonNode getCurrentUser(Long userId) {
        try {
            return identityClient.get()
                    .uri("/users/me")
                    .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Identity service /users/me call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode startOAuth2(String provider, String platform) {
        try {
            return identityClient.get()
                    .uri("/auth/oauth2/authorize/{provider}?platform={platform}", provider, platform)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service OAuth2 start failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode login(Map<String, Object> loginRequest) {
        try {
            return identityClient.post()
                    .uri("/auth/login")
                    .body(loginRequest)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service login failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode signup(Map<String, Object> signupRequest) {
        try {
            return identityClient.post()
                    .uri("/auth/signup")
                    .body(signupRequest)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service signup failed: {}", e.getMessage());
            throw e;
        }
    }
}
