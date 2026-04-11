package com.pochak.commerce.purchase.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.purchase.dto.PurchaseRequest;
import com.pochak.commerce.purchase.dto.PurchaseResponse;
import com.pochak.commerce.purchase.entity.PgType;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import com.pochak.commerce.purchase.service.PurchaseService;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PurchaseControllerTest {

    @Mock
    private PurchaseService purchaseService;

    @InjectMocks
    private PurchaseController purchaseController;

    @Test
    @DisplayName("POST /purchases - should create purchase (201)")
    void createPurchase_success() {
        // given
        Long userId = 1L;
        PurchaseRequest request = new PurchaseRequest();
        PurchaseResponse response = PurchaseResponse.builder()
                .id(1L)
                .userId(userId)
                .productId(10L)
                .pgType(PgType.KCP)
                .amount(new BigDecimal("9900"))
                .status(PurchaseStatus.COMPLETED)
                .build();

        given(purchaseService.createPurchase(eq(userId), any(PurchaseRequest.class))).willReturn(response);

        // when
        ResponseEntity<ApiResponse<PurchaseResponse>> result =
                purchaseController.createPurchase(userId, request);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData().getId()).isEqualTo(1L);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(PurchaseStatus.COMPLETED);
    }

    @Test
    @DisplayName("POST /purchases - should propagate service exception")
    void createPurchase_serviceThrows() {
        // given
        Long userId = 1L;
        PurchaseRequest request = new PurchaseRequest();
        given(purchaseService.createPurchase(eq(userId), any(PurchaseRequest.class)))
                .willThrow(new IllegalStateException("Product is inactive"));

        // when / then
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class,
                () -> purchaseController.createPurchase(userId, request));
    }

    @Test
    @DisplayName("GET /purchases - should return user purchases")
    void getPurchases_success() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 20);
        PurchaseResponse purchase = PurchaseResponse.builder()
                .id(1L)
                .userId(userId)
                .amount(new BigDecimal("9900"))
                .status(PurchaseStatus.COMPLETED)
                .build();
        Page<PurchaseResponse> page = new PageImpl<>(List.of(purchase), pageable, 1);

        given(purchaseService.getPurchases(userId, pageable)).willReturn(page);

        // when
        ResponseEntity<ApiResponse<Page<PurchaseResponse>>> result =
                purchaseController.getPurchases(userId, pageable);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getContent()).hasSize(1);
    }

    @Test
    @DisplayName("GET /purchases/{id} - should return single purchase")
    void getPurchase_success() {
        // given
        PurchaseResponse response = PurchaseResponse.builder()
                .id(1L)
                .amount(new BigDecimal("9900"))
                .build();
        given(purchaseService.getPurchase(1L)).willReturn(response);

        // when
        ResponseEntity<ApiResponse<PurchaseResponse>> result = purchaseController.getPurchase(1L);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("PUT /purchases/{id}/cancel - should cancel purchase")
    void cancelPurchase_success() {
        // given
        PurchaseResponse response = PurchaseResponse.builder()
                .id(1L)
                .status(PurchaseStatus.CANCELLED)
                .build();
        given(purchaseService.cancelPurchase(1L)).willReturn(response);

        // when
        ResponseEntity<ApiResponse<PurchaseResponse>> result = purchaseController.cancelPurchase(1L);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getStatus()).isEqualTo(PurchaseStatus.CANCELLED);
    }
}
