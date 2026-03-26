package com.pochak.content.asset.dto.vod;

import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VodAssetDetailResponse {

    private Long id;
    private Long matchId;
    private Long liveAssetId;
    private String title;
    private String vodUrl;
    private String thumbnailUrl;
    private Integer duration;
    private VodAsset.EncodingStatus encodingStatus;
    private Integer encodingProgress;
    private LiveAsset.Visibility visibility;
    private LiveAsset.OwnerType ownerType;
    private Long ownerId;
    private Boolean isMain;
    private Boolean isDisplayed;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VodAssetDetailResponse from(VodAsset entity) {
        return VodAssetDetailResponse.builder()
                .id(entity.getId())
                .matchId(entity.getMatch() != null ? entity.getMatch().getId() : null)
                .liveAssetId(entity.getLiveAsset() != null ? entity.getLiveAsset().getId() : null)
                .title(entity.getTitle())
                .vodUrl(entity.getVodUrl())
                .thumbnailUrl(entity.getThumbnailUrl())
                .duration(entity.getDuration())
                .encodingStatus(entity.getEncodingStatus())
                .encodingProgress(entity.getEncodingProgress())
                .visibility(entity.getVisibility())
                .ownerType(entity.getOwnerType())
                .ownerId(entity.getOwnerId())
                .isMain(entity.getIsMain())
                .isDisplayed(entity.getIsDisplayed())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
