package com.pochak.content.asset.dto.live;

import com.pochak.content.asset.entity.LiveAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LiveAssetListResponse {

    private Long id;
    private Long matchId;
    private String thumbnailUrl;
    private LiveAsset.LiveStatus status;
    private LiveAsset.Visibility visibility;
    private LiveAsset.OwnerType ownerType;
    private Boolean isDisplayed;
    private LocalDateTime startTime;
    private Integer viewCount;
    private LocalDateTime createdAt;

    public static LiveAssetListResponse from(LiveAsset entity) {
        return LiveAssetListResponse.builder()
                .id(entity.getId())
                .matchId(entity.getMatch() != null ? entity.getMatch().getId() : null)
                .thumbnailUrl(entity.getThumbnailUrl())
                .status(entity.getStatus())
                .visibility(entity.getVisibility())
                .ownerType(entity.getOwnerType())
                .isDisplayed(entity.getIsDisplayed())
                .startTime(entity.getStartTime())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
