package com.pochak.content.asset.dto.vod;

import com.pochak.content.asset.entity.LiveAsset;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVodAssetRequest {

    @NotNull(message = "matchId is required")
    private Long matchId;

    private Long liveAssetId;

    @NotBlank(message = "title is required")
    private String title;

    private String vodUrl;
    private String thumbnailUrl;
    private Integer duration;

    @Builder.Default
    private LiveAsset.Visibility visibility = LiveAsset.Visibility.PUBLIC;

    @Builder.Default
    private LiveAsset.OwnerType ownerType = LiveAsset.OwnerType.SYSTEM;

    private Long ownerId;
}
