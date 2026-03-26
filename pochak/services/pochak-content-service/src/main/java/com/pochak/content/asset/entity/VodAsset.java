package com.pochak.content.asset.entity;

import com.pochak.content.competition.entity.Match;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vod_assets", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class VodAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "live_asset_id")
    private LiveAsset liveAsset;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "vod_url", nullable = false, length = 500)
    private String vodUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer duration = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "encoding_status", nullable = false, length = 20)
    @Builder.Default
    private EncodingStatus encodingStatus = EncodingStatus.PENDING;

    @Column(name = "encoding_progress")
    @Builder.Default
    private Integer encodingProgress = 0;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LiveAsset.Visibility visibility = LiveAsset.Visibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_type", length = 20)
    private LiveAsset.OwnerType ownerType;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "is_main", nullable = false)
    @Builder.Default
    private Boolean isMain = false;

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

    public void update(String title, String vodUrl, String thumbnailUrl,
                       Integer duration, LiveAsset.Visibility visibility) {
        this.title = title;
        this.vodUrl = vodUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.duration = duration;
        this.visibility = visibility;
    }

    public void updateIsDisplayed(boolean isDisplayed) {
        this.isDisplayed = isDisplayed;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public enum EncodingStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}
