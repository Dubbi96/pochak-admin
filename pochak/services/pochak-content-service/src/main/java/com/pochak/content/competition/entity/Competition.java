package com.pochak.content.competition.entity;

import com.pochak.content.sport.entity.Sport;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "competitions", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Column(name = "name", nullable = false, columnDefinition = "VARCHAR(200)")
    private String name;

    @Column(name = "short_name", length = 50)
    private String shortName;

    @Column(name = "name_en", length = 200)
    private String nameEn;

    @Column(length = 500)
    private String description;

    @Column(length = 10)
    private String season;

    @Enumerated(EnumType.STRING)
    @Column(name = "competition_type", length = 20)
    @Builder.Default
    private CompetitionType competitionType = CompetitionType.TOURNAMENT;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CompetitionStatus status = CompetitionStatus.SCHEDULED;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", length = 20)
    @Builder.Default
    private CompetitionVisibility visibility = CompetitionVisibility.PUBLIC;

    @Column(name = "invite_code", length = 50, unique = true)
    private String inviteCode;

    @Column(name = "invite_code_version")
    @Builder.Default
    private Integer inviteCodeVersion = 1;

    @Column(name = "is_free")
    @Builder.Default
    private Boolean isFree = false;

    @Column(name = "is_displayed")
    @Builder.Default
    private Boolean isDisplayed = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum CompetitionStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum CompetitionType {
        TOURNAMENT, LEAGUE
    }

    public void update(String name, String shortName, CompetitionType competitionType,
                       Long sportId, Sport sport, LocalDate startDate, LocalDate endDate,
                       String description, Boolean isFree, Boolean isDisplayed) {
        this.name = name;
        if (shortName != null) this.shortName = shortName;
        if (competitionType != null) this.competitionType = competitionType;
        if (sport != null) this.sport = sport;
        if (startDate != null) this.startDate = startDate;
        if (endDate != null) this.endDate = endDate;
        if (description != null) this.description = description;
        if (isFree != null) this.isFree = isFree;
        if (isDisplayed != null) this.isDisplayed = isDisplayed;
    }

    public void softDelete() {
        this.active = false;
    }

    /**
     * Regenerate invite code, incrementing the version.
     * Old CompetitionVisits with the previous invite code become invalid.
     */
    public void regenerateInviteCode() {
        this.inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        this.inviteCodeVersion = (this.inviteCodeVersion != null ? this.inviteCodeVersion : 0) + 1;
    }
}
