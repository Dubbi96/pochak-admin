package com.pochak.identity.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.identity.user.dto.PushTokenResponse;
import com.pochak.identity.user.service.PushTokenService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = PushTokenController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(PushTokenControllerTest.TestExceptionHandler.class)
class PushTokenControllerTest {

    /**
     * Test-scoped exception handler for BusinessException.
     * The identity service does not yet have its own GlobalExceptionHandler,
     * so we provide one here to properly map BusinessException to HTTP status codes.
     */
    @RestControllerAdvice
    static class TestExceptionHandler {
        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
            return ResponseEntity.status(ex.getHttpStatus())
                    .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PushTokenService pushTokenService;

    // ==================== POST /users/me/push-tokens ====================

    @Nested
    @DisplayName("POST /users/me/push-tokens")
    class RegisterPushToken {

        @Test
        @DisplayName("Should register push token successfully and return 200")
        void success() throws Exception {
            // given
            PushTokenResponse response = PushTokenResponse.builder()
                    .id(1L)
                    .pushToken("fcm-token-abc")
                    .deviceType("FCM")
                    .deviceId("device-001")
                    .active(true)
                    .createdAt(LocalDateTime.of(2026, 3, 27, 10, 0))
                    .build();

            given(pushTokenService.register(eq(1L), any())).willReturn(response);

            Map<String, String> requestBody = Map.of(
                    "pushToken", "fcm-token-abc",
                    "deviceType", "FCM",
                    "deviceId", "device-001"
            );

            // when & then
            mockMvc.perform(post("/users/me/push-tokens")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestBody)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.pushToken").value("fcm-token-abc"))
                    .andExpect(jsonPath("$.data.deviceType").value("FCM"))
                    .andExpect(jsonPath("$.data.deviceId").value("device-001"))
                    .andExpect(jsonPath("$.data.active").value(true));
        }

        @Test
        @DisplayName("Should handle duplicate token reassignment and return 200")
        void duplicateToken_reassign() throws Exception {
            // given
            PushTokenResponse response = PushTokenResponse.builder()
                    .id(2L)
                    .pushToken("shared-token")
                    .deviceType("FCM")
                    .deviceId("new-device")
                    .active(true)
                    .createdAt(LocalDateTime.of(2026, 3, 27, 11, 0))
                    .build();

            given(pushTokenService.register(eq(5L), any())).willReturn(response);

            Map<String, String> requestBody = Map.of(
                    "pushToken", "shared-token",
                    "deviceType", "FCM",
                    "deviceId", "new-device"
            );

            // when & then
            mockMvc.perform(post("/users/me/push-tokens")
                            .header("X-User-Id", "5")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestBody)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.pushToken").value("shared-token"));
        }

        @Test
        @DisplayName("Should return 400 when pushToken is blank")
        void missingPushToken_returns400() throws Exception {
            // given
            Map<String, String> requestBody = Map.of(
                    "deviceType", "FCM"
            );

            // when & then
            mockMvc.perform(post("/users/me/push-tokens")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestBody)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when X-User-Id header is missing")
        void missingUserIdHeader_returns400() throws Exception {
            // given
            Map<String, String> requestBody = Map.of(
                    "pushToken", "some-token",
                    "deviceType", "FCM"
            );

            // when & then
            mockMvc.perform(post("/users/me/push-tokens")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestBody)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== DELETE /users/me/push-tokens ====================

    @Nested
    @DisplayName("DELETE /users/me/push-tokens")
    class DeletePushToken {

        @Test
        @DisplayName("Should delete push token successfully and return 200")
        void success() throws Exception {
            // given
            doNothing().when(pushTokenService).delete(eq(1L), eq("token-to-delete"));

            Map<String, String> requestBody = Map.of(
                    "pushToken", "token-to-delete"
            );

            // when & then
            mockMvc.perform(delete("/users/me/push-tokens")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestBody)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("Should return error when token does not exist")
        void tokenNotFound_returnsError() throws Exception {
            // given
            doThrow(new BusinessException(ErrorCode.NOT_FOUND, "Push token not found"))
                    .when(pushTokenService).delete(eq(1L), eq("nonexistent-token"));

            Map<String, String> requestBody = Map.of(
                    "pushToken", "nonexistent-token"
            );

            // when & then
            mockMvc.perform(delete("/users/me/push-tokens")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestBody)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 when pushToken is blank")
        void missingPushToken_returns400() throws Exception {
            // given
            String requestBody = "{}";

            // when & then
            mockMvc.perform(delete("/users/me/push-tokens")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when X-User-Id header is missing")
        void missingUserIdHeader_returns400() throws Exception {
            // given
            Map<String, String> requestBody = Map.of(
                    "pushToken", "some-token"
            );

            // when & then
            mockMvc.perform(delete("/users/me/push-tokens")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requestBody)))
                    .andExpect(status().isBadRequest());
        }
    }
}
