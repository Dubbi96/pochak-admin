package com.pochak.commerce.admin.dto;

import com.pochak.commerce.giftball.entity.GiftBall;
import com.pochak.commerce.giftball.entity.GiftBallStatus;

import java.time.LocalDateTime;

public record GiftBallResponse(
        Long id,
        Long senderUserId,
        Long receiverUserId,
        Integer amount,
        String message,
        GiftBallStatus status,
        LocalDateTime expiresAt,
        LocalDateTime createdAt
) {
    public static GiftBallResponse from(GiftBall gb) {
        return new GiftBallResponse(
                gb.getId(),
                gb.getSenderUserId(),
                gb.getReceiverUserId(),
                gb.getAmount(),
                gb.getMessage(),
                gb.getStatus(),
                gb.getExpiresAt(),
                gb.getCreatedAt()
        );
    }
}
