package com.pochak.commerce.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class PurchaseCompletedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final Long productId;
    private final BigDecimal amount;
    private final String paymentMethod;

    public PurchaseCompletedEvent(Long userId, Long productId, BigDecimal amount, String paymentMethod) {
        super(String.valueOf(productId));
        this.userId = userId;
        this.productId = productId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }
}
