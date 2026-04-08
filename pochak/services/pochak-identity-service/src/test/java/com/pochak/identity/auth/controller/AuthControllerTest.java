package com.pochak.identity.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.identity.auth.dto.SignInRequest;
import com.pochak.identity.auth.dto.SocialLoginRequest;
import com.pochak.identity.auth.dto.TokenResponse;
import com.pochak.identity.auth.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private TokenResponse testTokens() {
        return TokenResponse.builder()
                .accessToken("test-access-token")
                .refreshToken("test-refresh-token")
                .expiresIn(1800L)
                .tokenType("Bearer")
                .build();
    }

    // ==================== POST /auth/login ====================

    @Nested
    @DisplayName("POST /auth/login - Sign In")
    class SignInTests {

        @Test
        @DisplayName("Valid credentials return tokens with 200")
        void signIn_validCredentials_returnsTokens() throws Exception {
            SignInRequest request = SignInRequest.builder()
                    .email("user@example.com")
                    .password("password123")
                    .build();

            given(authService.signIn(any(SignInRequest.class))).willReturn(testTokens());

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.accessToken").value("test-access-token"))
                    .andExpect(jsonPath("$.data.refreshToken").value("test-refresh-token"))
                    .andExpect(jsonPath("$.data.expiresIn").value(1800))
                    .andExpect(jsonPath("$.data.tokenType").value("Bearer"));

            verify(authService).signIn(any(SignInRequest.class));
        }

        @Test
        @DisplayName("Missing email returns 400")
        void signIn_missingEmail_returns400() throws Exception {
            Map<String, String> request = Map.of("password", "password123");

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Missing password returns 400")
        void signIn_missingPassword_returns400() throws Exception {
            Map<String, String> request = Map.of("email", "user@example.com");

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Invalid email format returns 400")
        void signIn_invalidEmail_returns400() throws Exception {
            Map<String, String> request = Map.of(
                    "email", "not-an-email",
                    "password", "password123"
            );

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /auth/refresh ====================

    @Nested
    @DisplayName("POST /auth/refresh - Token Refresh")
    class RefreshTests {

        @Test
        @DisplayName("Valid refresh token returns new tokens with 200")
        void refresh_validToken_returnsNewTokens() throws Exception {
            given(authService.refresh("valid-refresh-token")).willReturn(testTokens());

            mockMvc.perform(post("/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    Map.of("refreshToken", "valid-refresh-token"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.accessToken").value("test-access-token"))
                    .andExpect(jsonPath("$.data.refreshToken").value("test-refresh-token"));

            verify(authService).refresh("valid-refresh-token");
        }

        @Test
        @DisplayName("Missing refreshToken throws BusinessException")
        void refresh_missingToken_returns400() throws Exception {
            mockMvc.perform(post("/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Blank refreshToken throws BusinessException")
        void refresh_blankToken_returns400() throws Exception {
            mockMvc.perform(post("/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    Map.of("refreshToken", "  "))))
                    .andExpect(status().is4xxClientError());
        }
    }

    // ==================== POST /auth/social ====================

    @Nested
    @DisplayName("POST /auth/social - Social Login")
    class SocialLoginTests {

        @Test
        @DisplayName("Valid social login returns tokens with 200")
        void socialLogin_valid_returnsTokens() throws Exception {
            SocialLoginRequest request = SocialLoginRequest.builder()
                    .provider("KAKAO")
                    .providerToken("kakao-token-123")
                    .providerUserId("kakao-user-id")
                    .build();

            given(authService.socialLogin(any(SocialLoginRequest.class))).willReturn(testTokens());

            mockMvc.perform(post("/auth/social")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.accessToken").value("test-access-token"));

            verify(authService).socialLogin(any(SocialLoginRequest.class));
        }

        @Test
        @DisplayName("Missing provider returns 400")
        void socialLogin_missingProvider_returns400() throws Exception {
            Map<String, String> request = Map.of("providerToken", "some-token");

            mockMvc.perform(post("/auth/social")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Missing providerToken returns 400")
        void socialLogin_missingProviderToken_returns400() throws Exception {
            Map<String, String> request = Map.of("provider", "KAKAO");

            mockMvc.perform(post("/auth/social")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /auth/logout ====================

    @Nested
    @DisplayName("POST /auth/logout - Logout")
    class LogoutTests {

        @Test
        @DisplayName("Logout with valid userId and Authorization header returns 200")
        void logout_validUser_returns200() throws Exception {
            doNothing().when(authService).logout(eq(1L), anyString());

            mockMvc.perform(post("/auth/logout")
                            .header("X-User-Id", "1")
                            .header("Authorization", "Bearer test-access-token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(authService).logout(eq(1L), eq("test-access-token"));
        }

        @Test
        @DisplayName("Logout without Authorization header still works (accessToken is null)")
        void logout_noAuthHeader_returns200() throws Exception {
            doNothing().when(authService).logout(eq(1L), isNull());

            mockMvc.perform(post("/auth/logout")
                            .header("X-User-Id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(authService).logout(eq(1L), isNull());
        }

        @Test
        @DisplayName("Logout without X-User-Id header returns 400")
        void logout_missingHeader_returns400() throws Exception {
            mockMvc.perform(post("/auth/logout"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== DELETE /auth/withdraw ====================

    @Nested
    @DisplayName("DELETE /auth/withdraw - Withdraw")
    class WithdrawTests {

        @Test
        @DisplayName("Withdraw with valid userId returns 200")
        void withdraw_validUser_returns200() throws Exception {
            doNothing().when(authService).withdraw(1L);

            mockMvc.perform(delete("/auth/withdraw")
                            .header("X-User-Id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(authService).withdraw(1L);
        }

        @Test
        @DisplayName("Withdraw without X-User-Id header returns 400")
        void withdraw_missingHeader_returns400() throws Exception {
            mockMvc.perform(delete("/auth/withdraw"))
                    .andExpect(status().isBadRequest());
        }
    }
}
