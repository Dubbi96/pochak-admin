package com.pochak.commerce.payment;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResult {
    private final boolean success;
    private final String pgTransactionId;
    private final String message;
    private final LocalDateTime verifiedAt;

    public static PaymentResult success(String pgTransactionId, String message) {
        return PaymentResult.builder()
                .success(true)
                .pgTransactionId(pgTransactionId)
                .message(message)
                .verifiedAt(LocalDateTime.now())
                .build();
    }

    public static PaymentResult failure(String message) {
        return PaymentResult.builder()
                .success(false)
                .pgTransactionId(null)
                .message(message)
                .verifiedAt(LocalDateTime.now())
                .build();
    }
}
