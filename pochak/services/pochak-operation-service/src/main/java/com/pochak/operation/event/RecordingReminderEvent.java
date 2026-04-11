package com.pochak.operation.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class RecordingReminderEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long scheduleId;
    private final Long userId;
    private final String title;
    private final Long venueId;
    private final LocalDateTime startTime;
    private final String notificationType;

    public RecordingReminderEvent(Long scheduleId, Long userId, String title,
                                  Long venueId, LocalDateTime startTime, String notificationType) {
        super(String.valueOf(scheduleId));
        this.scheduleId = scheduleId;
        this.userId = userId;
        this.title = title;
        this.venueId = venueId;
        this.startTime = startTime;
        this.notificationType = notificationType;
    }
}
