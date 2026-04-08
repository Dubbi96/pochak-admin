package com.pochak.identity.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.identity.auth.dto.*;
import com.pochak.identity.auth.service.GuardianVerificationService;
import com.pochak.identity.auth.service.PhoneVerificationService;
import com.pochak.identity.auth.service.SignupService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SignupController.class)
@AutoConfigureMockMvc(addFilters = false)
class SignupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SignupService signupService;

    @MockBean
    private PhoneVerificationService phoneVerificationService;

    @MockBean
    private GuardianVerificationService guardianVerificationService;

    private TokenResponse testTokens() {
        return TokenResponse.builder()
                .accessToken("test-access-token")
                .refreshToken("test-refresh-token")
                .expiresIn(1800L)
                .tokenType("Bearer")
                .build();
    }

    // ==================== POST /auth/signup (domestic) ====================

    @Nested
    @DisplayName("POST /auth/signup - Domestic Adult Signup")
    class DomesticSignupTests {

        @Test
        @DisplayName("Valid domestic signup returns tokens with 200")
        void signupDomestic_valid_returnsTokens() throws Exception {
            DomesticSignupRequest request = DomesticSignupRequest.builder()
                    .phoneVerifiedToken("verified-token-123")
                    .loginId("testuser01")
                    .password("securePass1")
                    .email("test@example.com")
                    .name("Test User")
                    .birthday(LocalDate.of(2000, 1, 1))
                    .consents(Map.of("TERMS_OF_SERVICE", true, "PRIVACY_POLICY", true))
                    .build();

            given(signupService.signupDomestic(any(DomesticSignupRequest.class))).willReturn(testTokens());

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.accessToken").value("test-access-token"))
                    .andExpect(jsonPath("$.data.refreshToken").value("test-refresh-token"))
                    .andExpect(jsonPath("$.data.expiresIn").value(1800))
                    .andExpect(jsonPath("$.data.tokenType").value("Bearer"));

            verify(signupService).signupDomestic(any(DomesticSignupRequest.class));
        }

        @Test
        @DisplayName("Missing required fields returns 400")
        void signupDomestic_missingFields_returns400() throws Exception {
            // Missing phoneVerifiedToken, loginId, password, name, birthday, consents
            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Short loginId returns 400")
        void signupDomestic_shortLoginId_returns400() throws Exception {
            DomesticSignupRequest request = DomesticSignupRequest.builder()
                    .phoneVerifiedToken("verified-token")
                    .loginId("ab")  // too short, min 4
                    .password("securePass1")
                    .name("Test")
                    .birthday(LocalDate.of(2000, 1, 1))
                    .consents(Map.of("TERMS_OF_SERVICE", true))
                    .build();

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Short password returns 400")
        void signupDomestic_shortPassword_returns400() throws Exception {
            DomesticSignupRequest request = DomesticSignupRequest.builder()
                    .phoneVerifiedToken("verified-token")
                    .loginId("testuser01")
                    .password("short")  // too short, min 8
                    .name("Test")
                    .birthday(LocalDate.of(2000, 1, 1))
                    .consents(Map.of("TERMS_OF_SERVICE", true))
                    .build();

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /auth/signup/social ====================

    @Nested
    @DisplayName("POST /auth/signup/social - Social Signup")
    class SocialSignupTests {

        @Test
        @DisplayName("Valid social signup returns tokens with 200")
        void signupSocial_valid_returnsTokens() throws Exception {
            given(signupService.signupSocial(any(SocialSignupRequest.class))).willReturn(testTokens());

            // Build a minimal valid request via raw JSON to avoid needing the full builder
            String requestJson = """
                    {
                      "phoneVerifiedToken": "verified-token-123",
                      "provider": "KAKAO",
                      "providerKey": "kakao-user-id-abc",
                      "name": "Kakao User",
                      "consents": {"TERMS_OF_SERVICE": true, "PRIVACY_POLICY": true}
                    }
                    """;

            mockMvc.perform(post("/auth/signup/social")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestJson))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.accessToken").value("test-access-token"));

            verify(signupService).signupSocial(any(SocialSignupRequest.class));
        }
    }

    // ==================== POST /auth/phone/send-code ====================

    @Nested
    @DisplayName("POST /auth/phone/send-code - Phone Verification")
    class PhoneSendCodeTests {

        @Test
        @DisplayName("Valid phone send-code returns 200")
        void sendCode_valid_returns200() throws Exception {
            Map<String, Object> serviceResponse = Map.of("verificationId", "abc-123", "expiresIn", 180);
            given(phoneVerificationService.sendVerificationCode("010-1234-5678", "SIGNUP"))
                    .willReturn(serviceResponse);

            PhoneVerificationRequest request = PhoneVerificationRequest.builder()
                    .phone("010-1234-5678")
                    .purpose("SIGNUP")
                    .build();

            mockMvc.perform(post("/auth/phone/send-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("Missing phone returns 400")
        void sendCode_missingPhone_returns400() throws Exception {
            mockMvc.perform(post("/auth/phone/send-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"purpose\": \"SIGNUP\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== POST /auth/phone/verify-code ====================

    @Nested
    @DisplayName("POST /auth/phone/verify-code - Phone Code Verification")
    class PhoneVerifyCodeTests {

        @Test
        @DisplayName("Valid verify-code returns 200")
        void verifyCode_valid_returns200() throws Exception {
            Map<String, Object> serviceResponse = Map.of("verifiedToken", "vt-123", "phone", "010-1234-5678");
            given(phoneVerificationService.verifyCode("010-1234-5678", "123456", "SIGNUP"))
                    .willReturn(serviceResponse);

            PhoneVerifyCodeRequest request = PhoneVerifyCodeRequest.builder()
                    .phone("010-1234-5678")
                    .code("123456")
                    .purpose("SIGNUP")
                    .build();

            mockMvc.perform(post("/auth/phone/verify-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("Missing code returns 400")
        void verifyCode_missingCode_returns400() throws Exception {
            mockMvc.perform(post("/auth/phone/verify-code")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"phone\": \"010-1234-5678\", \"purpose\": \"SIGNUP\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /auth/phone/check ====================

    @Nested
    @DisplayName("GET /auth/phone/check - Phone Registration Check")
    class PhoneCheckTests {

        @Test
        @DisplayName("Check phone registration returns 200")
        void checkPhone_returns200() throws Exception {
            Map<String, Object> serviceResponse = Map.of("registered", false);
            given(phoneVerificationService.checkPhoneRegistration("010-1234-5678"))
                    .willReturn(serviceResponse);

            mockMvc.perform(get("/auth/phone/check")
                            .param("phone", "010-1234-5678"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }
    }

    // ==================== POST /auth/guardian/verify ====================

    @Nested
    @DisplayName("POST /auth/guardian/verify - Guardian Verification")
    class GuardianVerifyTests {

        @Test
        @DisplayName("Valid guardian token returns 200")
        void verifyGuardian_valid_returns200() throws Exception {
            Map<String, Object> serviceResponse = Map.of("guardianUserId", 100, "verified", true);
            given(guardianVerificationService.verifyGuardian("guardian-verified-token-abc"))
                    .willReturn(serviceResponse);

            mockMvc.perform(post("/auth/guardian/verify")
                            .param("guardianVerifiedToken", "guardian-verified-token-abc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }
    }

    // ==================== GET /auth/check-duplicate ====================

    @Nested
    @DisplayName("GET /auth/check-duplicate - Duplicate Check")
    class CheckDuplicateTests {

        @Test
        @DisplayName("Check loginId availability returns 200")
        void checkDuplicate_loginId_returns200() throws Exception {
            CheckDuplicateResponse response = CheckDuplicateResponse.builder()
                    .loginIdAvailable(true)
                    .build();

            given(signupService.checkDuplicate("testuser01", null, null)).willReturn(response);

            mockMvc.perform(get("/auth/check-duplicate")
                            .param("loginId", "testuser01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.loginIdAvailable").value(true));
        }

        @Test
        @DisplayName("Check email availability returns 200")
        void checkDuplicate_email_returns200() throws Exception {
            CheckDuplicateResponse response = CheckDuplicateResponse.builder()
                    .emailAvailable(false)
                    .build();

            given(signupService.checkDuplicate(null, "taken@example.com", null)).willReturn(response);

            mockMvc.perform(get("/auth/check-duplicate")
                            .param("email", "taken@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.emailAvailable").value(false));
        }
    }
}
