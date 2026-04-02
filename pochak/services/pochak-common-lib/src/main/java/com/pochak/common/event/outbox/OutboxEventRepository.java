package com.pochak.common.event.outbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link OutboxEvent}.
 *
 * <p>Provides queries used by the outbox poller to retrieve unpublished events
 * and to bulk-mark them as published after successful broker delivery.</p>
 */
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    /**
     * Returns all events that have not yet been published to the message broker.
     *
     * @return list of unpublished outbox events, ordered by creation time ascending
     */
    List<OutboxEvent> findByPublishedAtIsNullOrderByCreatedAtAsc();

    /**
     * Marks a single event as published by setting its {@code publishedAt} timestamp.
     *
     * @param id          the outbox event ID
     * @param publishedAt the publish timestamp
     */
    @Modifying
    @Query("UPDATE OutboxEvent e SET e.publishedAt = :publishedAt WHERE e.id = :id")
    void markAsPublished(@Param("id") UUID id, @Param("publishedAt") LocalDateTime publishedAt);
}
