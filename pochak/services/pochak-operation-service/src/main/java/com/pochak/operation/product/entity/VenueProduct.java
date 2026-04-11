package com.pochak.operation.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "venue_products", schema = "operation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class VenueProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 30)
    private VenueProductType productType;

    @Column(name = "price_per_hour", nullable = false)
    @Builder.Default
    private Integer pricePerHour = 0;

    @Column(name = "price_per_day")
    private Integer pricePerDay;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "included_cameras", nullable = false)
    @Builder.Default
    private Integer includedCameras = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void update(String name, String description, Integer pricePerHour,
                       Integer pricePerDay, Integer maxCapacity, Integer includedCameras) {
        this.name = name;
        this.description = description;
        this.pricePerHour = pricePerHour;
        if (pricePerDay != null) this.pricePerDay = pricePerDay;
        if (maxCapacity != null) this.maxCapacity = maxCapacity;
        this.includedCameras = includedCameras;
    }

    public void softDelete() {
        this.isActive = false;
    }
}
