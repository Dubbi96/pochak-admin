package com.pochak.commerce.wallet.service;

import com.pochak.commerce.wallet.dto.ChargeRequest;
import com.pochak.commerce.wallet.dto.UsePointsRequest;
import com.pochak.commerce.wallet.dto.WalletResponse;
import com.pochak.commerce.wallet.entity.Wallet;
import com.pochak.commerce.wallet.entity.WalletLedger;
import com.pochak.commerce.wallet.repository.WalletLedgerRepository;
import com.pochak.commerce.wallet.repository.WalletRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @InjectMocks
    private WalletService walletService;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletLedgerRepository walletLedgerRepository;

    @Test
    @DisplayName("Should create wallet if not exists and return it")
    void testGetWallet_createIfNotExists() {
        Long userId = 1L;
        Wallet newWallet = Wallet.builder()
                .id(1L)
                .userId(userId)
                .balance(0)
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(walletRepository.save(any(Wallet.class))).thenReturn(newWallet);

        WalletResponse response = walletService.getWallet(userId);

        assertNotNull(response);
        assertEquals(userId, response.getUserId());
        assertEquals(0, response.getBalance());
        verify(walletRepository).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Should return existing wallet")
    void testGetWallet_existingWallet() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .id(1L)
                .userId(userId)
                .balance(500)
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));

        WalletResponse response = walletService.getWallet(userId);

        assertNotNull(response);
        assertEquals(500, response.getBalance());
        verify(walletRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should charge points to wallet")
    void testCharge() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .id(1L)
                .userId(userId)
                .balance(100)
                .build();
        ChargeRequest request = ChargeRequest.builder()
                .amount(500)
                .paymentMethod("CARD")
                .build();

        when(walletRepository.findByUserIdForUpdate(userId)).thenReturn(Optional.of(wallet));
        when(walletLedgerRepository.save(any(WalletLedger.class))).thenAnswer(i -> i.getArgument(0));

        WalletResponse response = walletService.charge(userId, request);

        assertNotNull(response);
        assertEquals(600, response.getBalance());
        verify(walletLedgerRepository).save(any(WalletLedger.class));
    }

    @Test
    @DisplayName("Should throw exception when using points with insufficient balance")
    void testUse_insufficientBalance() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .id(1L)
                .userId(userId)
                .balance(50)
                .build();
        UsePointsRequest request = UsePointsRequest.builder()
                .amount(100)
                .description("Test use")
                .build();

        when(walletRepository.findByUserIdForUpdate(userId)).thenReturn(Optional.of(wallet));

        assertThrows(IllegalStateException.class, () -> walletService.usePoints(userId, request));
    }

    @Test
    @DisplayName("Should use points from wallet successfully")
    void testUse_success() {
        Long userId = 1L;
        Wallet wallet = Wallet.builder()
                .id(1L)
                .userId(userId)
                .balance(500)
                .build();
        UsePointsRequest request = UsePointsRequest.builder()
                .amount(200)
                .referenceType("PURCHASE")
                .referenceId(10L)
                .description("Test use")
                .build();

        when(walletRepository.findByUserIdForUpdate(userId)).thenReturn(Optional.of(wallet));
        when(walletLedgerRepository.save(any(WalletLedger.class))).thenAnswer(i -> i.getArgument(0));

        WalletResponse response = walletService.usePoints(userId, request);

        assertNotNull(response);
        assertEquals(300, response.getBalance());
        verify(walletLedgerRepository).save(any(WalletLedger.class));
    }
}
