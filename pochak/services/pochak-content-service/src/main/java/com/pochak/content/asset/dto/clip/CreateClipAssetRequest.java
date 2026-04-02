package com.pochak.content.asset.dto.clip;

import com.pochak.content.asset.entity.ClipAsset;
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
public class CreateClipAssetRequest {

    @NotNull(message = "sourceType is required")
    private ClipAsset.SourceType sourceType;

    @NotNull(message = "sourceId is required")
    private Long sourceId;

    private Long matchId;
    private Long creatorUserId;

    @NotBlank(message = "title is required")
    private String title;

    private Integer startTimeSec;
    private Integer endTimeSec;

    @Builder.Default
    private LiveAsset.Visibility visibility = LiveAsset.Visibility.PUBLIC;

    private Long visibleTeamId;
}
