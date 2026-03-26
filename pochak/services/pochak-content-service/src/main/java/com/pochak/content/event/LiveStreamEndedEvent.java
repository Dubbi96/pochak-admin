package com.pochak.content.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

import java.time.Duration;

@Getter
public class LiveStreamEndedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long matchId;
    private final Duration duration;

    public LiveStreamEndedEvent(Long matchId, Duration duration) {
        super(String.valueOf(matchId));
        this.matchId = matchId;
        this.duration = duration;
    }
}
