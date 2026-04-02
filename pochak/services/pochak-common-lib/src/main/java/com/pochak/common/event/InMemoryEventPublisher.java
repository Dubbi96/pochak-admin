package com.pochak.common.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * In-memory event publisher using Spring's ApplicationEventPublisher.
 * Acts as fallback when RabbitMQ is not configured.
 */
@Slf4j
@Component
@ConditionalOnMissingBean(name = "rabbitMqEventPublisher")
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
