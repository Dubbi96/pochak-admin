package com.pochak.common.event.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.common.event.DomainEvent;
import com.pochak.common.event.RabbitMqConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Scheduled poller that reads unpublished {@link OutboxEvent} rows and forwards them
 * to RabbitMQ.
 *
 * <p>Runs at a configurable interval (default: every 5 seconds). Each poll iteration
 * reads all rows where {@code publishedAt IS NULL}, publishes them to the broker,
 * and marks them as published. Failures are logged and retried on the next cycle.</p>
 *
 * <p>Configuration properties:</p>
 * <ul>
 *     <li>{@code pochak.outbox.enabled} &mdash; must be {@code true} to activate (default: false)</li>
 *     <li>{@code pochak.outbox.poll-interval-ms} &mdash; polling interval in milliseconds (default: 5000)</li>
 * </ul>
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "pochak.outbox.enabled", havingValue = "true")
@RequiredArgsConstructor
public class OutboxPoller {

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Polls unpublished outbox events and delivers them to RabbitMQ.
     *
     * <p>Each event is individually published and marked as delivered. If a single event
     * fails, the error is logged and processing continues with the remaining events;
     * the failed event will be retried on the next poll cycle.</p>
     */
    @Scheduled(fixedDelayString = "${pochak.outbox.poll-interval-ms:5000}")
    @Transactional
    public void pollAndPublish() {
        List<OutboxEvent> unpublished = outboxEventRepository.findByPublishedAtIsNullOrderByCreatedAtAsc();

        if (unpublished.isEmpty()) {
            return;
        }

        log.debug("[Outbox] Polling {} unpublished events", unpublished.size());

        for (OutboxEvent outbox : unpublished) {
            try {
                DomainEvent event = objectMapper.readValue(outbox.getPayload(), DomainEvent.class);
                String routingKey = resolveRoutingKey(event);

                rabbitTemplate.convertAndSend(
                        RabbitMqConfig.EXCHANGE_NAME,
                        routingKey,
                        event
                );

                outbox.markPublished();
                outboxEventRepository.save(outbox);

                log.info("[Outbox] Published event: {} | outboxId={} routingKey={}",
                        outbox.getEventType(), outbox.getId(), routingKey);

            } catch (Exception e) {
                log.error("[Outbox] Failed to publish event: {} | outboxId={} error={}. Will retry next cycle.",
                        outbox.getEventType(), outbox.getId(), e.getMessage(), e);
                // Do not rethrow — continue with remaining events
            }
        }
    }

    /**
     * Resolves the RabbitMQ routing key from the event.
     * If the eventType already contains a dot, it is used as-is (e.g., "identity.UserWithdrawnEvent").
     * Otherwise, falls back to the eventType itself.
     */
    private String resolveRoutingKey(DomainEvent event) {
        if (event.getEventType() != null && event.getEventType().contains(".")) {
            return event.getEventType();
        }
        return event.getEventType();
    }
}
