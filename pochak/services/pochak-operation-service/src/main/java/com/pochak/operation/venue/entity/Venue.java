package com.pochak.operation.venue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "venues", schema = "operation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sport_id", nullable = false)
    private Long sportId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "venue_type", nullable = false)
    private VenueType venueType;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_type", nullable = false)
    private OwnerType ownerType;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "address")
    private String address;

    @Column(name = "address_detail")
    private String addressDetail;

    @Column(name = "si_gun_gu_code")
    private String siGunGuCode;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "qr_code")
    private String qrCode;

    @Column(name = "pixellot_club_id")
    private String pixellotClubId;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void update(Long sportId, String name, VenueType venueType, OwnerType ownerType,
                       Long ownerId, String address, String addressDetail, String siGunGuCode,
                       String zipCode, BigDecimal latitude, BigDecimal longitude,
                       String description, String qrCode, String pixellotClubId) {
        this.sportId = sportId;
        this.name = name;
        this.venueType = venueType;
        this.ownerType = ownerType;
        this.ownerId = ownerId;
        this.address = address;
        this.addressDetail = addressDetail;
        this.siGunGuCode = siGunGuCode;
        this.zipCode = zipCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.qrCode = qrCode;
        this.pixellotClubId = pixellotClubId;
    }

    public void softDelete() {
        this.isActive = false;
    }
}
