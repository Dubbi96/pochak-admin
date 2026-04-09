package com.pochak.operation.venue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "venue_closed_days", schema = "operation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class VenueClosedDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "closed_type", nullable = false, length = 20)
    private String closedType;  // REGULAR / TEMPORARY

    @Column(name = "day_of_week")
    private Integer dayOfWeek;  // REGULAR 전용 (1=Mon~7=Sun)

    @Column(name = "closed_date")
    private LocalDate closedDate;  // TEMPORARY 전용

    @Column(name = "reason", length = 200)
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
