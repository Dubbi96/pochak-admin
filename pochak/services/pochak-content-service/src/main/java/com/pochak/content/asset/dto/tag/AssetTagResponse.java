package com.pochak.content.asset.dto.tag;

import com.pochak.content.asset.entity.AssetTag;
import com.pochak.content.asset.entity.LiveAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AssetTagResponse {

    private Long id;
    private Integer sportTagId;
    private String assetType;
    private Long assetId;
    private Long taggerUserId;
    private Integer tagTimeSec;
    private String tagName;
    private Long teamId;
    private Integer uniformNumber;
    private LiveAsset.Visibility visibility;
    private Boolean isDisplayed;
    private LocalDateTime createdAt;

    public static AssetTagResponse from(AssetTag entity) {
        return AssetTagResponse.builder()
                .id(entity.getId())
                .sportTagId(entity.getSportTagId())
                .assetType(entity.getAssetType())
                .assetId(entity.getAssetId())
                .taggerUserId(entity.getTaggerUserId())
                .tagTimeSec(entity.getTagTimeSec())
                .tagName(entity.getTagName())
                .teamId(entity.getTeamId())
                .uniformNumber(entity.getUniformNumber())
                .visibility(entity.getVisibility())
                .isDisplayed(entity.getIsDisplayed())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
