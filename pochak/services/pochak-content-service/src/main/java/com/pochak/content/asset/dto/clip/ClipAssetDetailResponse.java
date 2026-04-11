package com.pochak.content.asset.dto.clip;

import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ClipAssetDetailResponse {

    private Long id;
    private ClipAsset.SourceType sourceType;
    private Long sourceId;
    private Long matchId;
    private Long creatorUserId;
    private String title;
    private String clipUrl;
    private String thumbnailUrl;
    private ClipAsset.AspectRatio aspectRatio;
    private Integer startTimeSec;
    private Integer endTimeSec;
    private Integer duration;
    private VodAsset.EncodingStatus encodingStatus;
    private LiveAsset.Visibility visibility;
    private Long visibleTeamId;
    private Boolean isDisplayed;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ClipAssetDetailResponse from(ClipAsset entity) {
        return ClipAssetDetailResponse.builder()
                .id(entity.getId())
                .sourceType(entity.getSourceType())
                .sourceId(entity.getSourceId())
                .matchId(entity.getMatch() != null ? entity.getMatch().getId() : null)
                .creatorUserId(entity.getCreatorUserId())
                .title(entity.getTitle())
                .clipUrl(entity.getClipUrl())
                .thumbnailUrl(entity.getThumbnailUrl())
                .aspectRatio(entity.getAspectRatio())
                .startTimeSec(entity.getStartTimeSec())
                .endTimeSec(entity.getEndTimeSec())
                .duration(entity.getDuration())
                .encodingStatus(entity.getEncodingStatus())
                .visibility(entity.getVisibility())
                .visibleTeamId(entity.getVisibleTeamId())
                .isDisplayed(entity.getIsDisplayed())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
