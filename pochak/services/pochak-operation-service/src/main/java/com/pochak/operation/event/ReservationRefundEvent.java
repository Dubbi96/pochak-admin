package com.pochak.operation.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

@Getter
public class ReservationRefundEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long reservationId;
    private final Long userId;
    private final Integer refundAmount;

    public ReservationRefundEvent(Long reservationId, Long userId, Integer refundAmount) {
        super(String.valueOf(reservationId));
        this.reservationId = reservationId;
        this.userId = userId;
        this.refundAmount = refundAmount;
    }
}
