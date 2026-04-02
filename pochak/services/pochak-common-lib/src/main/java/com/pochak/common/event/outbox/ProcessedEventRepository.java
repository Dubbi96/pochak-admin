package com.pochak.common.event.outbox;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Spring Data JPA repository for {@link ProcessedEvent}.
 *
 * <p>Used by {@link IdempotentEventConsumer} to check for and record
 * already-processed events, enabling exactly-once consumer semantics.</p>
 */
public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, UUID> {
}
