package com.pochak.app.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
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

    public JsonNode getMyGuardian(Long userId) {
        try {
            return identityClient.get()
                    .uri("/guardians/my-guardian")
                    .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Identity service guardian call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode startOAuth2Pkce(String provider, String codeChallenge, String codeChallengeMethod) {
        try {
            return identityClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/auth/oauth2/authorize/{provider}")
                            .queryParam("platform", "mobile")
                            .queryParam("code_challenge", codeChallenge)
                            .queryParam("code_challenge_method", codeChallengeMethod)
                            .build(provider))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service OAuth2 PKCE start failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode signupMinor(Map<String, Object> signupRequest, String guardianToken) {
        try {
            return identityClient.post()
                    .uri("/auth/signup/minor")
                    .header("Authorization", "Bearer " + guardianToken)
                    .body(signupRequest)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service minor signup failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode verifyGuardian(String token) {
        try {
            return identityClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/auth/guardian/verify")
                            .queryParam("guardianVerifiedToken", token)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service guardian verify failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode registerPushToken(Long userId, Map<String, Object> pushRequest) {
        try {
            return identityClient.post()
                    .uri("/users/me/push-tokens")
                    .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                    .body(pushRequest)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service push register failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode unregisterPushToken(Long userId, Map<String, Object> body) {
        try {
            return identityClient.method(HttpMethod.DELETE)
                    .uri("/users/me/push-tokens")
                    .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.error("Identity service push unregister failed: {}", e.getMessage());
            throw e;
        }
    }
}
