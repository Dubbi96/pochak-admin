package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pochak.web.bff.client.IdentityServiceClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class WebAuthControllerTest {

    @Mock
    private IdentityServiceClient identityClient;

    @InjectMocks
    private WebAuthController webAuthController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Should start OAuth2 flow and return identity service response")
    void testStartOAuth2() {
        // given
        ObjectNode oauthResult = objectMapper.createObjectNode();
        oauthResult.put("authorizationUrl", "https://accounts.google.com/o/oauth2/auth?...");

        given(identityClient.startOAuth2("google", "web")).willReturn(oauthResult);

        // when
        ResponseEntity<JsonNode> response = webAuthController.startOAuth2("google");

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("authorizationUrl").asText())
                .startsWith("https://accounts.google.com");
    }

    @Test
    @DisplayName("Should process login request and return tokens")
    void testLogin() {
        // given
        Map<String, Object> loginRequest = Map.of(
                "email", "user@test.com",
                "password", "securePassword123"
        );
        ObjectNode loginResult = objectMapper.createObjectNode();
        loginResult.put("accessToken", "jwt-token");
        loginResult.put("refreshToken", "refresh-token");

        given(identityClient.login(loginRequest)).willReturn(loginResult);

        // when
        ResponseEntity<JsonNode> response = webAuthController.login(loginRequest);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().get("accessToken").asText()).isEqualTo("jwt-token");
    }

    @Test
    @DisplayName("Should process signup request and return result")
    void testSignup() {
        // given
        Map<String, Object> signupRequest = Map.of(
                "email", "new@test.com",
                "nickname", "newuser"
        );
        ObjectNode signupResult = objectMapper.createObjectNode();
        signupResult.put("userId", 123);

        given(identityClient.signup(signupRequest)).willReturn(signupResult);

        // when
        ResponseEntity<JsonNode> response = webAuthController.signup(signupRequest);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().get("userId").asInt()).isEqualTo(123);
    }

    @Test
    @DisplayName("Should propagate exception when identity service login fails")
    void testLoginFailure() {
        // given
        Map<String, Object> loginRequest = Map.of("email", "bad@test.com");
        given(identityClient.login(loginRequest)).willThrow(new RestClientException("Connection refused"));

        // when / then
        assertThatThrownBy(() -> webAuthController.login(loginRequest))
                .isInstanceOf(RestClientException.class);
    }
}
