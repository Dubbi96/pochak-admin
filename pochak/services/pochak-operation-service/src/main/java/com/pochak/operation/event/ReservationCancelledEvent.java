package com.pochak.operation.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

@Getter
public class ReservationCancelledEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long reservationId;
    private final String reason;

    public ReservationCancelledEvent(Long reservationId, String reason) {
        super(String.valueOf(reservationId));
        this.reservationId = reservationId;
        this.reason = reason;
    }
}
