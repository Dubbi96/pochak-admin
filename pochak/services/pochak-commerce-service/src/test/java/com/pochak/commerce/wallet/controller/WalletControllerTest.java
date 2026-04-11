package com.pochak.commerce.wallet.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.wallet.dto.ChargeRequest;
import com.pochak.commerce.wallet.dto.WalletResponse;
import com.pochak.commerce.wallet.service.WalletService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WalletControllerTest {

    @Mock
    private WalletService walletService;

    @InjectMocks
    private WalletController walletController;

    @Test
    @DisplayName("GET /wallet - should return wallet balance (200)")
    void getWallet_success() {
        // given
        Long userId = 1L;
        WalletResponse response = WalletResponse.builder()
                .id(1L)
                .userId(userId)
                .balance(5000)
                .build();
        given(walletService.getWallet(userId)).willReturn(response);

        // when
        ResponseEntity<ApiResponse<WalletResponse>> result = walletController.getWallet(userId);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData().getBalance()).isEqualTo(5000);
        assertThat(result.getBody().getData().getUserId()).isEqualTo(userId);
    }

    @Test
    @DisplayName("GET /wallet - should propagate exception when wallet not found")
    void getWallet_notFound() {
        // given
        Long userId = 99L;
        given(walletService.getWallet(userId)).willThrow(new RuntimeException("Wallet not found"));

        // when / then
        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class,
                () -> walletController.getWallet(userId));
    }

    @Test
    @DisplayName("POST /wallet/charge - should charge wallet")
    void charge_success() {
        // given
        Long userId = 1L;
        ChargeRequest request = ChargeRequest.builder()
                .amount(10000)
                .paymentMethod("CARD")
                .build();
        WalletResponse response = WalletResponse.builder()
                .id(1L)
                .userId(userId)
                .balance(15000)
                .build();
        given(walletService.charge(userId, request)).willReturn(response);

        // when
        ResponseEntity<ApiResponse<WalletResponse>> result = walletController.charge(userId, request);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getBalance()).isEqualTo(15000);
        verify(walletService).charge(userId, request);
    }
}
