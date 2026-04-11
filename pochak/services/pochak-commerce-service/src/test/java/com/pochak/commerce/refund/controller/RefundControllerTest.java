package com.pochak.commerce.refund.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.refund.dto.ProcessRefundRequest;
import com.pochak.commerce.refund.dto.RefundRequest;
import com.pochak.commerce.refund.dto.RefundResponse;
import com.pochak.commerce.refund.entity.RefundStatus;
import com.pochak.commerce.refund.service.RefundService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RefundControllerTest {

    @Mock
    private RefundService refundService;

    @InjectMocks
    private RefundController refundController;

    @Test
    @DisplayName("POST /refunds - should create refund request (201)")
    void createRefund_success() {
        // given
        Long userId = 1L;
        RefundRequest request = RefundRequest.builder()
                .purchaseId(10L)
                .reason("Not satisfied")
                .build();
        RefundResponse response = RefundResponse.builder()
                .id(1L)
                .purchaseId(10L)
                .userId(userId)
                .refundAmount(new BigDecimal("9900"))
                .reason("Not satisfied")
                .status(RefundStatus.REQUESTED)
                .createdAt(LocalDateTime.now())
                .build();

        given(refundService.createRefund(eq(userId), any(RefundRequest.class))).willReturn(response);

        // when
        ResponseEntity<ApiResponse<RefundResponse>> result =
                refundController.createRefund(userId, request);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData().getId()).isEqualTo(1L);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(RefundStatus.REQUESTED);
        assertThat(result.getBody().getData().getReason()).isEqualTo("Not satisfied");
    }

    @Test
    @DisplayName("POST /refunds - should propagate exception on invalid purchase")
    void createRefund_invalidPurchase() {
        // given
        Long userId = 1L;
        RefundRequest request = RefundRequest.builder()
                .purchaseId(999L)
                .reason("Invalid")
                .build();
        given(refundService.createRefund(eq(userId), any(RefundRequest.class)))
                .willThrow(new RuntimeException("Purchase not found"));

        // when / then
        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class,
                () -> refundController.createRefund(userId, request));
    }

    @Test
    @DisplayName("GET /refunds - should return refund list")
    void getRefunds_success() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        RefundResponse refund = RefundResponse.builder()
                .id(1L)
                .purchaseId(10L)
                .status(RefundStatus.REQUESTED)
                .build();
        Page<RefundResponse> page = new PageImpl<>(List.of(refund), pageable, 1);

        given(refundService.getRefunds(eq(RefundStatus.REQUESTED), eq(pageable))).willReturn(page);

        // when
        ResponseEntity<ApiResponse<Page<RefundResponse>>> result =
                refundController.getRefunds(RefundStatus.REQUESTED, pageable);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getContent()).hasSize(1);
    }

    @Test
    @DisplayName("PUT /refunds/{id}/process - should process refund")
    void processRefund_success() {
        // given
        ProcessRefundRequest request = ProcessRefundRequest.builder()
                .approved(true)
                .adminNote("Approved by admin")
                .build();
        RefundResponse response = RefundResponse.builder()
                .id(1L)
                .status(RefundStatus.APPROVED)
                .processedAt(LocalDateTime.now())
                .build();

        given(refundService.processRefund(eq(1L), any(ProcessRefundRequest.class))).willReturn(response);

        // when
        ResponseEntity<ApiResponse<RefundResponse>> result =
                refundController.processRefund(1L, request);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(RefundStatus.APPROVED);
        verify(refundService).processRefund(eq(1L), any(ProcessRefundRequest.class));
    }
}
