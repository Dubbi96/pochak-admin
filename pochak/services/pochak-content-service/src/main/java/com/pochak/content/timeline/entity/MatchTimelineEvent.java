package com.pochak.content.timeline.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_timeline_events", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MatchTimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type", nullable = false, length = 20)
    private String contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private EventType eventType;

    /**
     * Timestamp in seconds from the start of the content.
     */
    @Column(name = "timestamp_seconds", nullable = false)
    private Integer timestampSeconds;

    @Column(length = 500)
    private String description;

    @Column(name = "team_id")
    private Long teamId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum EventType {
        GOAL,
        FOUL,
        CARD,
        SUBSTITUTION,
        TIMEOUT,
        HIGHLIGHT
    }
}
