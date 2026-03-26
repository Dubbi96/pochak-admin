package com.pochak.common.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base class for all domain events.
 * Supports both InMemory and JSON serialization (for future Kafka/RabbitMQ migration).
 * The {@code type} field stores the concrete event class name for deserialization routing.
 */
@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", defaultImpl = Void.class)
public abstract class DomainEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventId;
    private String eventType;
    private LocalDateTime occurredAt;
    private String aggregateId;
    private String type;

    /**
     * Default constructor required for Jackson deserialization.
     */
    protected DomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = this.getClass().getSimpleName();
        this.occurredAt = LocalDateTime.now();
        this.type = this.getClass().getSimpleName();
    }

    protected DomainEvent(String aggregateId) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = this.getClass().getSimpleName();
        this.occurredAt = LocalDateTime.now();
        this.aggregateId = aggregateId;
        this.type = this.getClass().getSimpleName();
    }

    protected DomainEvent(String eventType, String aggregateId) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.occurredAt = LocalDateTime.now();
        this.aggregateId = aggregateId;
        this.type = this.getClass().getSimpleName();
    }
}
