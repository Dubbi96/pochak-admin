package com.pochak.content.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class LiveStreamStartedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long matchId;
    private final Long venueId;
    private final LocalDateTime startTime;

    public LiveStreamStartedEvent(Long matchId, Long venueId, LocalDateTime startTime) {
        super(String.valueOf(matchId));
        this.matchId = matchId;
        this.venueId = venueId;
        this.startTime = startTime;
    }
}
