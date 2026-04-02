package com.pochak.content.asset.dto.vod;

import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VodAssetListResponse {

    private Long id;
    private Long matchId;
    private String title;
    private String thumbnailUrl;
    private Integer duration;
    private VodAsset.EncodingStatus encodingStatus;
    private LiveAsset.Visibility visibility;
    private LiveAsset.OwnerType ownerType;
    private Boolean isDisplayed;
    private Integer viewCount;
    private LocalDateTime createdAt;

    public static VodAssetListResponse from(VodAsset entity) {
        return VodAssetListResponse.builder()
                .id(entity.getId())
                .matchId(entity.getMatch() != null ? entity.getMatch().getId() : null)
                .title(entity.getTitle())
                .thumbnailUrl(entity.getThumbnailUrl())
                .duration(entity.getDuration())
                .encodingStatus(entity.getEncodingStatus())
                .visibility(entity.getVisibility())
                .ownerType(entity.getOwnerType())
                .isDisplayed(entity.getIsDisplayed())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
