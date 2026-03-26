package com.pochak.commerce.purchase.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.purchase.dto.PurchaseRequest;
import com.pochak.commerce.purchase.dto.PurchaseResponse;
import com.pochak.commerce.purchase.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseResponse>> createPurchase(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody PurchaseRequest request) {
        PurchaseResponse response = purchaseService.createPurchase(userId, request);
        return ResponseEntity.created(URI.create("/purchases/" + response.getId()))
                .body(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PurchaseResponse>>> getPurchases(
            @RequestHeader("X-User-Id") Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseService.getPurchases(userId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseResponse>> getPurchase(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseService.getPurchase(id)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PurchaseResponse>> cancelPurchase(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseService.cancelPurchase(id)));
    }
}
