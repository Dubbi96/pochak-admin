package com.pochak.commerce.refund.dto;

import com.pochak.commerce.refund.entity.Refund;
import com.pochak.commerce.refund.entity.RefundStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class RefundResponse {

    private Long id;
    private Long purchaseId;
    private Long userId;
    private BigDecimal refundAmount;
    private String reason;
    private RefundStatus status;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;

    public static RefundResponse from(Refund refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .purchaseId(refund.getPurchaseId())
                .userId(refund.getUserId())
                .refundAmount(refund.getRefundAmount())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .processedAt(refund.getProcessedAt())
                .createdAt(refund.getCreatedAt())
                .build();
    }
}
