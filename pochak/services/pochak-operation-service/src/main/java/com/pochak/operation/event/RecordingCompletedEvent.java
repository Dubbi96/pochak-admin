package com.pochak.operation.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

@Getter
public class RecordingCompletedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long sessionId;
    private final Long scheduleId;
    private final Long userId;
    private final Long venueId;
    private final Long cameraId;

    public RecordingCompletedEvent(Long sessionId, Long scheduleId, Long userId, Long venueId, Long cameraId) {
        super(String.valueOf(sessionId));
        this.sessionId = sessionId;
        this.scheduleId = scheduleId;
        this.userId = userId;
        this.venueId = venueId;
        this.cameraId = cameraId;
    }
}
