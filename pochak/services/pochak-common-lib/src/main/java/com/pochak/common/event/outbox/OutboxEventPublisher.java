package com.pochak.common.event.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.common.event.DomainEvent;
import com.pochak.common.event.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Outbox-based event publisher that replaces direct RabbitMQ publishing.
 *
 * <p>Instead of sending events to the broker immediately, this publisher serializes
 * the {@link DomainEvent} to JSON and persists it as an {@link OutboxEvent} row
 * within the <b>same database transaction</b> as the domain state change.
 * A separate {@link OutboxPoller} then reads unpublished rows and forwards them
 * to RabbitMQ, achieving at-least-once delivery without 2PC.</p>
 *
 * <p>Activated when {@code pochak.outbox.enabled=true}. When active, this bean
 * takes precedence over {@code RabbitMqEventPublisher} and {@code InMemoryEventPublisher}
 * because it is a primary candidate selected by the conditional property.</p>
 */
@Slf4j
@Component("outboxEventPublisher")
@ConditionalOnProperty(name = "pochak.outbox.enabled", havingValue = "true")
@RequiredArgsConstructor
public class OutboxEventPublisher implements EventPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    /**
     * Persists the domain event as an outbox row in the current transaction.
     *
     * <p>This method must be called within an active transaction (typically the same
     * transaction that performs the domain state change). The event is serialized to JSON
     * and stored; actual broker delivery happens asynchronously via the poller.</p>
     *
     * @param event the domain event to publish
     * @throws IllegalStateException if JSON serialization fails
     */
    @Override
    @Transactional
    public void publish(DomainEvent event) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            log.error("[Outbox] Failed to serialize event: {} | eventId={} error={}",
                    event.getEventType(), event.getEventId(), e.getMessage(), e);
            throw new IllegalStateException("Failed to serialize domain event to JSON", e);
        }

        OutboxEvent outboxEvent = new OutboxEvent(
                event.getEventType(),
                event.getAggregateId(),
                payload
        );

        outboxEventRepository.save(outboxEvent);

        log.info("[Outbox] Saved event to outbox: {} | outboxId={} eventId={} aggregateId={}",
                event.getEventType(), outboxEvent.getId(), event.getEventId(), event.getAggregateId());
    }
}
