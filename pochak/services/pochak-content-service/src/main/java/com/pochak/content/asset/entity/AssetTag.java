package com.pochak.content.asset.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_tags", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AssetTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sport_tag_id")
    private Integer sportTagId;

    @Column(name = "asset_type", nullable = false, length = 10)
    private String assetType;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "tagger_user_id", nullable = false)
    private Long taggerUserId;

    @Column(name = "tag_time_sec", nullable = false)
    private Integer tagTimeSec;

    @Column(name = "tag_name", length = 100)
    private String tagName;

    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "uniform_number")
    private Integer uniformNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LiveAsset.Visibility visibility = LiveAsset.Visibility.PUBLIC;

    @Column(name = "is_displayed", nullable = false)
    @Builder.Default
    private Boolean isDisplayed = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
