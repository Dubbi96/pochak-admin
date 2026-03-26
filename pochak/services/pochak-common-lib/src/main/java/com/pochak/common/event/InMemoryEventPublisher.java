package com.pochak.common.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * In-memory event publisher using Spring's ApplicationEventPublisher.
 * This is the Phase 0-2 stub implementation.
 * Will be replaced by RabbitMQ-backed implementation in Phase 3.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InMemoryEventPublisher implements EventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publish(DomainEvent event) {
        log.info("[Event] Publishing {} | eventId={} aggregateId={}",
                event.getEventType(), event.getEventId(), event.getAggregateId());
        applicationEventPublisher.publishEvent(event);
    }
}
