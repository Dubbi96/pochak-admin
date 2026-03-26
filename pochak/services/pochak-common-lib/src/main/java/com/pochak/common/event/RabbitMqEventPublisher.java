package com.pochak.common.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * RabbitMQ-backed event publisher.
 * Uses best-effort publishing: catches AmqpException, logs error, does NOT rollback transaction.
 * Activated only when spring.rabbitmq.host is configured; otherwise InMemoryEventPublisher is used.
 */
@Slf4j
@Component("rabbitMqEventPublisher")
@ConditionalOnProperty(name = "spring.rabbitmq.host")
@RequiredArgsConstructor
public class RabbitMqEventPublisher implements EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publish(DomainEvent event) {
        String routingKey = resolveRoutingKey(event);
        log.info("[Event] Publishing to RabbitMQ: {} | routingKey={} eventId={} aggregateId={}",
                event.getEventType(), routingKey, event.getEventId(), event.getAggregateId());
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMqConfig.EXCHANGE_NAME,
                    routingKey,
                    event
            );
        } catch (AmqpException e) {
            log.error("[Event] Failed to publish event to RabbitMQ: {} | eventId={} error={}",
                    event.getEventType(), event.getEventId(), e.getMessage(), e);
            // Best-effort: do not propagate — transaction should NOT rollback
        }
    }

    /**
     * Resolves the routing key from the event type.
     * Convention: eventType is like "MemberRegistered" → routing key is the eventType in lowercase,
     * prefixed with the domain extracted from the event's class package.
     *
     * If the eventType already contains a dot (e.g., "identity.UserWithdrawnEvent"), it is used
     * as-is. This supports events defined in common-lib that specify their origin domain explicitly.
     *
     * Fallback: uses eventType directly as routing key.
     */
    private String resolveRoutingKey(DomainEvent event) {
        // If eventType already contains a dot, it's a fully-qualified routing key
        if (event.getEventType().contains(".")) {
            return event.getEventType();
        }

        String packageName = event.getClass().getPackageName();
        // Extract service domain from package: com.pochak.{service}.event.XxxEvent
        // e.g., com.pochak.identity.domain.event → identity
        String[] parts = packageName.split("\\.");
        if (parts.length >= 3) {
            String domain = parts[2]; // e.g., "identity", "content", "commerce", "operation", "admin"
            return domain + "." + event.getEventType();
        }
        return event.getEventType();
    }
}
