package com.pochak.content.livestream.entity;

import com.pochak.content.competition.entity.Match;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "live_streams", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LiveStream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "streamer_user_id", nullable = false)
    private Long streamerUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @Column(name = "stream_key", nullable = false, unique = true)
    private String streamKey;

    @Column(name = "stream_url", length = 500)
    private String streamUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StreamStatus status = StreamStatus.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StreamVisibility visibility = StreamVisibility.PUBLIC;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "peak_viewer_count", nullable = false)
    @Builder.Default
    private Integer peakViewerCount = 0;

    @Column(name = "total_view_count", nullable = false)
    @Builder.Default
    private Long totalViewCount = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void start(String streamUrl) {
        if (this.status != StreamStatus.SCHEDULED) {
            throw new IllegalStateException("Only SCHEDULED streams can be started");
        }
        this.status = StreamStatus.LIVE;
        this.startedAt = LocalDateTime.now();
        this.streamUrl = streamUrl;
    }

    public void stop(int finalPeakViewerCount, long finalTotalViewCount) {
        if (this.status != StreamStatus.LIVE) {
            throw new IllegalStateException("Only LIVE streams can be stopped");
        }
        this.status = StreamStatus.ENDED;
        this.endedAt = LocalDateTime.now();
        this.peakViewerCount = finalPeakViewerCount;
        this.totalViewCount = finalTotalViewCount;
    }

    public void updatePeakViewerCount(int currentViewerCount) {
        if (currentViewerCount > this.peakViewerCount) {
            this.peakViewerCount = currentViewerCount;
        }
    }

    public void markError() {
        this.status = StreamStatus.ERROR;
        this.endedAt = LocalDateTime.now();
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public enum StreamStatus {
        SCHEDULED, LIVE, ENDED, ERROR
    }

    public enum StreamVisibility {
        PUBLIC, TEAM_ONLY, MEMBERS_ONLY, PRIVATE
    }
}
