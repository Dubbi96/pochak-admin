package com.pochak.content.team.entity;

import com.pochak.content.sport.entity.Sport;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Column(name = "short_name", length = 20)
    private String shortName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String description;

    @Column(name = "home_stadium", length = 200)
    private String homeStadium;

    @Column(name = "si_gun_gu_code", length = 10)
    private String siGunGuCode;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "club_status", length = 20)
    @Builder.Default
    private ClubStatus clubStatus = ClubStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum ClubStatus {
        ACTIVE, SUSPENDED, DISSOLVED
    }

    public void updateClubStatus(ClubStatus newStatus) {
        this.clubStatus = newStatus;
        if (newStatus == ClubStatus.DISSOLVED) {
            this.active = false;
        } else if (newStatus == ClubStatus.ACTIVE) {
            this.active = true;
        }
    }
}
