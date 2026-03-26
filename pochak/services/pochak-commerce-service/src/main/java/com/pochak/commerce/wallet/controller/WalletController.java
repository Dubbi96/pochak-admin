package com.pochak.commerce.wallet.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.wallet.dto.ChargeRequest;
import com.pochak.commerce.wallet.dto.UsePointsRequest;
import com.pochak.commerce.wallet.dto.WalletHistoryResponse;
import com.pochak.commerce.wallet.dto.WalletResponse;
import com.pochak.commerce.wallet.entity.LedgerType;
import com.pochak.commerce.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(walletService.getWallet(userId)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<WalletHistoryResponse>>> getWalletHistory(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) LedgerType ledgerType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                walletService.getWalletHistory(userId, ledgerType, dateFrom, dateTo, pageable)));
    }

    @PostMapping("/charge")
    public ResponseEntity<ApiResponse<WalletResponse>> charge(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChargeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(walletService.charge(userId, request)));
    }

    @PostMapping("/use")
    public ResponseEntity<ApiResponse<WalletResponse>> usePoints(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UsePointsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(walletService.usePoints(userId, request)));
    }
}
