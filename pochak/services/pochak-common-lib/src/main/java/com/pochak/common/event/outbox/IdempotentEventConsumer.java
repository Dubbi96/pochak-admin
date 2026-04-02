package com.pochak.common.event.outbox;

import com.pochak.common.event.DomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Abstract base class for idempotent event consumers.
 *
 * <p>Provides built-in deduplication by checking the {@code processed_events} table
 * before processing. If an event with the same {@code eventId} has already been
 * processed, it is silently skipped. Otherwise, the concrete {@link #handleEvent}
 * method is invoked and the event ID is recorded &mdash; all within the same
 * database transaction.</p>
 *
 * <h3>Usage</h3>
 * <pre>{@code
 * @Component
 * public class UserWithdrawnHandler extends IdempotentEventConsumer<UserWithdrawnEvent> {
 *
 *     @Override
 *     protected void handleEvent(UserWithdrawnEvent event) {
 *         // domain-specific cleanup logic
 *     }
 * }
 * }</pre>
 *
 * @param <T> the concrete {@link DomainEvent} type this consumer handles
 */
@Slf4j
public abstract class IdempotentEventConsumer<T extends DomainEvent> {

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    /**
     * Entry point called by the messaging infrastructure (e.g., RabbitMQ listener).
     *
     * <p>Checks for duplicates, delegates to {@link #handleEvent} if new, and records
     * the event ID upon success. The entire operation runs in a single transaction.</p>
     *
     * @param event the received domain event
     */
    @Transactional
    public void consume(T event) {
        UUID eventId = UUID.fromString(event.getEventId());

        if (processedEventRepository.existsById(eventId)) {
            log.info("[Idempotent] Duplicate event skipped: {} | eventId={}",
                    event.getEventType(), event.getEventId());
            return;
        }

        log.info("[Idempotent] Processing event: {} | eventId={} aggregateId={}",
                event.getEventType(), event.getEventId(), event.getAggregateId());

        handleEvent(event);

        processedEventRepository.save(new ProcessedEvent(eventId));

        log.info("[Idempotent] Event processed and recorded: {} | eventId={}",
                event.getEventType(), event.getEventId());
    }

    /**
     * Implement this method with the domain-specific event handling logic.
     *
     * <p>This method is called within a transaction that also records the event as
     * processed. If this method throws, the transaction rolls back and the event
     * will be redelivered.</p>
     *
     * @param event the domain event to handle
     */
    protected abstract void handleEvent(T event);
}
