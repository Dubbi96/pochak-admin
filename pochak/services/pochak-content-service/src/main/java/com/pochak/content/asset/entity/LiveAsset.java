package com.pochak.content.asset.entity;

import com.pochak.content.competition.entity.Match;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "live_assets", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LiveAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @Column(name = "camera_id")
    private Long cameraId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LiveStatus status = LiveStatus.SCHEDULED;

    @Column(name = "stream_url", length = 500)
    private String streamUrl;

    @Column(name = "panorama_url", length = 500)
    private String panoramaUrl;

    @Column(name = "hd_url", length = 500)
    private String hdUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_type", length = 20)
    private OwnerType ownerType;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "pixellot_event_id", length = 100)
    private String pixellotEventId;

    @Column(name = "is_displayed", nullable = false)
    @Builder.Default
    private Boolean isDisplayed = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void update(Long cameraId, String streamUrl, String panoramaUrl, String hdUrl,
                       String thumbnailUrl, Visibility visibility, LocalDateTime startTime) {
        this.cameraId = cameraId;
        this.streamUrl = streamUrl;
        this.panoramaUrl = panoramaUrl;
        this.hdUrl = hdUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.visibility = visibility;
        this.startTime = startTime;
    }

    public void updateIsDisplayed(boolean isDisplayed) {
        this.isDisplayed = isDisplayed;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public enum LiveStatus {
        SCHEDULED, BROADCASTING, ENDED, ERROR
    }

    public enum Visibility {
        PUBLIC, TEAM_ONLY, MEMBERS_ONLY, PRIVATE
    }

    public enum OwnerType {
        SYSTEM, TEAM, ORGANIZATION, USER
    }
}
