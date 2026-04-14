package com.pochak.commerce.admin.dto;

import com.pochak.commerce.wallet.entity.Wallet;

import java.time.LocalDateTime;

public record UserPointsResponse(
        Long walletId,
        Long userId,
        Integer balance,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserPointsResponse from(Wallet wallet) {
        return new UserPointsResponse(
                wallet.getId(),
                wallet.getUserId(),
                wallet.getBalance(),
                wallet.getCreatedAt(),
                wallet.getUpdatedAt()
        );
    }
}
