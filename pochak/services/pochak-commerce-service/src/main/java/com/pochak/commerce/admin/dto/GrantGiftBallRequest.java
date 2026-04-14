package com.pochak.commerce.admin.dto;

public record GrantGiftBallRequest(
        Long senderUserId,
        Long receiverUserId,
        Integer amount,
        String message
) {}
