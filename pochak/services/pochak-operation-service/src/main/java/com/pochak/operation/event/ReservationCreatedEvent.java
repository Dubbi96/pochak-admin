package com.pochak.operation.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReservationCreatedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long reservationId;
    private final Long venueId;
    private final Long userId;
    private final LocalDateTime startTime;

    public ReservationCreatedEvent(Long reservationId, Long venueId, Long userId, LocalDateTime startTime) {
        super(String.valueOf(reservationId));
        this.reservationId = reservationId;
        this.venueId = venueId;
        this.userId = userId;
        this.startTime = startTime;
    }
}
