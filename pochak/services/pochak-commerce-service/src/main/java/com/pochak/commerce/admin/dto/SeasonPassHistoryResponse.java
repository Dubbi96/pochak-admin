package com.pochak.commerce.admin.dto;

import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SeasonPassHistoryResponse(
        Long purchaseId,
        Long userId,
        String productName,
        BigDecimal amount,
        PurchaseStatus status,
        LocalDateTime purchasedAt
) {
    public static SeasonPassHistoryResponse from(Purchase purchase) {
        return new SeasonPassHistoryResponse(
                purchase.getId(),
                purchase.getUserId(),
                purchase.getProductName(),
                purchase.getAmount(),
                purchase.getStatus(),
                purchase.getCreatedAt()
        );
    }
}
