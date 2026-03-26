package com.pochak.content.asset.dto.clip;

import com.pochak.content.asset.entity.LiveAsset;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateClipAssetRequest {

    private String title;
    private LiveAsset.Visibility visibility;
    private Long visibleTeamId;
    private Integer startTimeSec;
    private Integer endTimeSec;
}
