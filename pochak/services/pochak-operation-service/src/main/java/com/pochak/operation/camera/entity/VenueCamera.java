package com.pochak.operation.camera.entity;

import com.pochak.operation.venue.entity.Venue;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "venue_cameras", schema = "operation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class VenueCamera {

    @EmbeddedId
    private VenueCameraId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("venueId")
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cameraId")
    @JoinColumn(name = "camera_id")
    private Camera camera;

    @Column(name = "position", length = 100)
    private String position;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;
}
