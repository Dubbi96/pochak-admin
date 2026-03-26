package com.pochak.content.asset.dto.clip;

import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ClipAssetListResponse {

    private Long id;
    private ClipAsset.SourceType sourceType;
    private Long matchId;
    private String title;
    private String thumbnailUrl;
    private Integer duration;
    private VodAsset.EncodingStatus encodingStatus;
    private LiveAsset.Visibility visibility;
    private Boolean isDisplayed;
    private Integer viewCount;
    private LocalDateTime createdAt;

    public static ClipAssetListResponse from(ClipAsset entity) {
        return ClipAssetListResponse.builder()
                .id(entity.getId())
                .sourceType(entity.getSourceType())
                .matchId(entity.getMatch() != null ? entity.getMatch().getId() : null)
                .title(entity.getTitle())
                .thumbnailUrl(entity.getThumbnailUrl())
                .duration(entity.getDuration())
                .encodingStatus(entity.getEncodingStatus())
                .visibility(entity.getVisibility())
                .isDisplayed(entity.getIsDisplayed())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
