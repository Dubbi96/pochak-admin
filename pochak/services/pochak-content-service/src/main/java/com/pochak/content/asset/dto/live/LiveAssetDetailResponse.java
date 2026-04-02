package com.pochak.content.asset.dto.live;

import com.pochak.content.asset.entity.LiveAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LiveAssetDetailResponse {

    private Long id;
    private Long matchId;
    private Long cameraId;
    private String streamUrl;
    private String panoramaUrl;
    private String hdUrl;
    private String thumbnailUrl;
    private LiveAsset.LiveStatus status;
    private LiveAsset.Visibility visibility;
    private LiveAsset.OwnerType ownerType;
    private Long ownerId;
    private String pixellotEventId;
    private Boolean isDisplayed;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LiveAssetDetailResponse from(LiveAsset entity) {
        return LiveAssetDetailResponse.builder()
                .id(entity.getId())
                .matchId(entity.getMatch() != null ? entity.getMatch().getId() : null)
                .cameraId(entity.getCameraId())
                .streamUrl(entity.getStreamUrl())
                .panoramaUrl(entity.getPanoramaUrl())
                .hdUrl(entity.getHdUrl())
                .thumbnailUrl(entity.getThumbnailUrl())
                .status(entity.getStatus())
                .visibility(entity.getVisibility())
                .ownerType(entity.getOwnerType())
                .ownerId(entity.getOwnerId())
                .pixellotEventId(entity.getPixellotEventId())
                .isDisplayed(entity.getIsDisplayed())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
