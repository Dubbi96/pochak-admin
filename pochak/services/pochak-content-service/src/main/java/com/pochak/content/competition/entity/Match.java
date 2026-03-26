package com.pochak.content.competition.entity;

import com.pochak.content.sport.entity.Sport;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "matches", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id")
    private Sport sport;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "venue_id")
    private Long venueId;

    @Column(length = 200)
    private String venue;

    @Column(length = 50)
    private String round;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MatchStatus status = MatchStatus.SCHEDULED;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    @Column(name = "is_panorama")
    @Builder.Default
    private Boolean isPanorama = false;

    @Column(name = "is_scoreboard")
    @Builder.Default
    private Boolean isScoreboard = false;

    @Column(name = "is_displayed")
    @Builder.Default
    private Boolean isDisplayed = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MatchParticipant> participants = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum MatchStatus {
        SCHEDULED, LIVE, COMPLETED, CANCELLED, CLOSED
    }

    public void update(String title, Competition competition, Sport sport,
                       Long venueId, LocalDateTime startTime, LocalDateTime endTime,
                       Boolean isPanorama, Boolean isScoreboard, Boolean isDisplayed) {
        if (title != null) this.title = title;
        if (competition != null) this.competition = competition;
        if (sport != null) this.sport = sport;
        if (venueId != null) this.venueId = venueId;
        if (startTime != null) this.startTime = startTime;
        if (endTime != null) this.endTime = endTime;
        if (isPanorama != null) this.isPanorama = isPanorama;
        if (isScoreboard != null) this.isScoreboard = isScoreboard;
        if (isDisplayed != null) this.isDisplayed = isDisplayed;
    }

    public void changeStatus(MatchStatus newStatus) {
        this.status = newStatus;
    }

    public void softDelete() {
        this.active = false;
    }
}
