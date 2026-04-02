package com.pochak.common.event.outbox;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Idempotency record for consumed events.
 *
 * <p>Before processing a received event, consumers check whether an entry with the
 * same {@code eventId} already exists. If it does, the event is a duplicate and can
 * be safely skipped. After successful processing, a new row is inserted in the
 * <b>same transaction</b> as the side-effect, ensuring exactly-once semantics.</p>
 *
 * <p>The table schema is determined by the consuming service's {@code default_schema}
 * setting; no hardcoded schema is specified here.</p>
 */
@Entity
@Table(name = "processed_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProcessedEvent {

    /**
     * The original domain event's eventId (UUID). Serves as a natural primary key.
     */
    @Id
    @Column(name = "event_id", updatable = false, nullable = false)
    private UUID eventId;

    @Column(name = "processed_at", nullable = false, updatable = false)
    private LocalDateTime processedAt;

    public ProcessedEvent(UUID eventId) {
        this.eventId = eventId;
        this.processedAt = LocalDateTime.now();
    }
}
