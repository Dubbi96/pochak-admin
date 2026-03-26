package com.pochak.commerce.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class RefundProcessedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final Long refundId;
    private final BigDecimal amount;

    public RefundProcessedEvent(Long userId, Long refundId, BigDecimal amount) {
        super(String.valueOf(refundId));
        this.userId = userId;
        this.refundId = refundId;
        this.amount = amount;
    }
}
