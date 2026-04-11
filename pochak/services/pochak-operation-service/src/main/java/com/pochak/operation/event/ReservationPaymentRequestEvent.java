package com.pochak.operation.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

@Getter
public class ReservationPaymentRequestEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long reservationId;
    private final Long userId;
    private final Integer totalPrice;
    private final Long venueProductId;

    public ReservationPaymentRequestEvent(Long reservationId, Long userId, Integer totalPrice, Long venueProductId) {
        super(String.valueOf(reservationId));
        this.reservationId = reservationId;
        this.userId = userId;
        this.totalPrice = totalPrice;
        this.venueProductId = venueProductId;
    }
}
