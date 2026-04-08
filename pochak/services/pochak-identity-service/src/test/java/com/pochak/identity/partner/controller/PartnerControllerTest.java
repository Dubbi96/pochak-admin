package com.pochak.identity.partner.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.identity.partner.dto.PartnerResponse;
import com.pochak.identity.partner.dto.RegisterPartnerRequest;
import com.pochak.identity.partner.entity.PartnerStatus;
import com.pochak.identity.partner.service.PartnerService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = PartnerController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(PartnerControllerTest.TestExceptionHandler.class)
class PartnerControllerTest {

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
    private PartnerService partnerService;

    private PartnerResponse testPartnerResponse() {
        return PartnerResponse.builder()
                .id(1L)
                .userId(10L)
                .businessName("Test Business")
                .businessNumber("123-45-67890")
                .contactPhone("010-9876-5432")
                .bankAccount("1234567890")
                .bankName("KB")
                .commissionRate(BigDecimal.valueOf(10))
                .status(PartnerStatus.PENDING)
                .createdAt(LocalDateTime.of(2026, 3, 1, 12, 0))
                .updatedAt(LocalDateTime.of(2026, 3, 1, 12, 0))
                .build();
    }

    // ==================== POST /api/v1/partners/register ====================

    @Nested
    @DisplayName("POST /api/v1/partners/register - Partner Registration")
    class RegisterPartnerTests {

        @Test
        @DisplayName("Valid registration returns partner with 201")
        void register_valid_returnsPartner() throws Exception {
            RegisterPartnerRequest request = RegisterPartnerRequest.builder()
                    .businessName("Test Business")
                    .businessNumber("123-45-67890")
                    .contactPhone("010-9876-5432")
                    .bankAccount("1234567890")
                    .bankName("KB")
                    .build();

            given(partnerService.register(eq(10L), any(RegisterPartnerRequest.class)))
                    .willReturn(testPartnerResponse());

            mockMvc.perform(post("/api/v1/partners/register")
                            .header("X-User-Id", "10")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.businessName").value("Test Business"))
                    .andExpect(jsonPath("$.data.businessNumber").value("123-45-67890"))
                    .andExpect(jsonPath("$.data.status").value("PENDING"));

            verify(partnerService).register(eq(10L), any(RegisterPartnerRequest.class));
        }

        @Test
        @DisplayName("Missing businessName returns 400")
        void register_missingBusinessName_returns400() throws Exception {
            String requestJson = """
                    {
                      "businessNumber": "123-45-67890",
                      "contactPhone": "010-9876-5432"
                    }
                    """;

            mockMvc.perform(post("/api/v1/partners/register")
                            .header("X-User-Id", "10")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestJson))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Missing businessNumber returns 400")
        void register_missingBusinessNumber_returns400() throws Exception {
            String requestJson = """
                    {
                      "businessName": "Test Business",
                      "contactPhone": "010-9876-5432"
                    }
                    """;

            mockMvc.perform(post("/api/v1/partners/register")
                            .header("X-User-Id", "10")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestJson))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Missing X-User-Id header returns 400")
        void register_missingUserIdHeader_returns400() throws Exception {
            RegisterPartnerRequest request = RegisterPartnerRequest.builder()
                    .businessName("Test Business")
                    .businessNumber("123-45-67890")
                    .contactPhone("010-9876-5432")
                    .build();

            mockMvc.perform(post("/api/v1/partners/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Duplicate partner returns error")
        void register_duplicatePartner_returnsError() throws Exception {
            RegisterPartnerRequest request = RegisterPartnerRequest.builder()
                    .businessName("Test Business")
                    .businessNumber("123-45-67890")
                    .contactPhone("010-9876-5432")
                    .build();

            given(partnerService.register(eq(10L), any(RegisterPartnerRequest.class)))
                    .willThrow(new BusinessException(ErrorCode.DUPLICATE,
                            "Partner already registered for this user"));

            mockMvc.perform(post("/api/v1/partners/register")
                            .header("X-User-Id", "10")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    // ==================== GET /api/v1/partners/me ====================

    @Nested
    @DisplayName("GET /api/v1/partners/me - Get My Partner Info")
    class GetMyPartnerInfoTests {

        @Test
        @DisplayName("Returns partner info with 200")
        void getMyPartnerInfo_valid_returnsPartner() throws Exception {
            given(partnerService.getMyPartnerInfo(10L)).willReturn(testPartnerResponse());

            mockMvc.perform(get("/api/v1/partners/me")
                            .header("X-User-Id", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.userId").value(10))
                    .andExpect(jsonPath("$.data.businessName").value("Test Business"))
                    .andExpect(jsonPath("$.data.status").value("PENDING"));

            verify(partnerService).getMyPartnerInfo(10L);
        }

        @Test
        @DisplayName("Missing X-User-Id header returns 400")
        void getMyPartnerInfo_missingHeader_returns400() throws Exception {
            mockMvc.perform(get("/api/v1/partners/me"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Partner not found returns 404")
        void getMyPartnerInfo_notFound_returns404() throws Exception {
            given(partnerService.getMyPartnerInfo(99L))
                    .willThrow(new BusinessException(ErrorCode.NOT_FOUND,
                            "Partner not found for user: 99"));

            mockMvc.perform(get("/api/v1/partners/me")
                            .header("X-User-Id", "99"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }
}
