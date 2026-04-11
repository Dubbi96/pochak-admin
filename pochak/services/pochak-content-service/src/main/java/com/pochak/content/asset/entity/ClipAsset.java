package com.pochak.content.asset.entity;

import com.pochak.content.competition.entity.Match;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "clip_assets", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ClipAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 10)
    private SourceType sourceType;

    @Column(name = "source_id", nullable = false)
    private Long sourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @Column(name = "creator_user_id", nullable = false)
    private Long creatorUserId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "clip_url", length = 500)
    private String clipUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "aspect_ratio", length = 16)
    @Builder.Default
    private AspectRatio aspectRatio = AspectRatio.RATIO_16_9;

    @Column(name = "start_time_sec", nullable = false)
    private Integer startTimeSec;

    @Column(name = "end_time_sec", nullable = false)
    private Integer endTimeSec;

    @Column(nullable = false)
    private Integer duration;

    @Enumerated(EnumType.STRING)
    @Column(name = "encoding_status", nullable = false, length = 20)
    @Builder.Default
    private VodAsset.EncodingStatus encodingStatus = VodAsset.EncodingStatus.PENDING;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LiveAsset.Visibility visibility = LiveAsset.Visibility.PUBLIC;

    @Column(name = "visible_team_id")
    private Long visibleTeamId;

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

    public void update(String title, LiveAsset.Visibility visibility, Long visibleTeamId,
                       Integer startTimeSec, Integer endTimeSec) {
        this.title = title;
        this.visibility = visibility;
        this.visibleTeamId = visibleTeamId;
        this.startTimeSec = startTimeSec;
        this.endTimeSec = endTimeSec;
    }

    public void updateIsDisplayed(boolean isDisplayed) {
        this.isDisplayed = isDisplayed;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public enum SourceType {
        LIVE, VOD
    }

    public enum AspectRatio {
        RATIO_16_9,
        RATIO_9_16
    }
}
