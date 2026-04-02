package com.pochak.common.event.outbox;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Transactional Outbox entity.
 *
 * <p>Domain services persist an {@code OutboxEvent} in the <b>same transaction</b> as their
 * domain state change. A scheduled poller later reads unpublished rows and forwards them
 * to RabbitMQ, guaranteeing at-least-once delivery without distributed transactions.</p>
 *
 * <p>The table schema is determined by the consuming service's {@code default_schema}
 * setting; no hardcoded schema is specified here.</p>
 */
@Entity
@Table(name = "outbox_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OutboxEvent {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Discriminator for event routing, e.g. "UserWithdrawnEvent" or "identity.UserWithdrawnEvent".
     */
    @Column(name = "event_type", nullable = false, length = 255)
    private String eventType;

    /**
     * Identifier of the aggregate that produced this event (e.g. user ID).
     */
    @Column(name = "aggregate_id", nullable = false, length = 255)
    private String aggregateId;

    /**
     * JSON-serialized payload of the original {@link com.pochak.common.event.DomainEvent}.
     */
    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * {@code null} while unpublished; set to the timestamp at which the poller
     * successfully forwarded this event to the message broker.
     */
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    /**
     * Creates a new unpublished outbox event.
     *
     * @param eventType   event type discriminator
     * @param aggregateId aggregate identifier
     * @param payload     JSON-serialized event body
     */
    public OutboxEvent(String eventType, String aggregateId, String payload) {
        this.id = UUID.randomUUID();
        this.eventType = eventType;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.createdAt = LocalDateTime.now();
        this.publishedAt = null;
    }

    /**
     * Marks the event as published. Called by the outbox poller after successful broker delivery.
     */
    public void markPublished() {
        this.publishedAt = LocalDateTime.now();
    }
}
