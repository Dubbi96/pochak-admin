package com.pochak.content.asset.dto.vod;

import com.pochak.content.asset.entity.LiveAsset;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateVodAssetRequest {

    private String title;
    private String vodUrl;
    private String thumbnailUrl;
    private Integer duration;
    private LiveAsset.Visibility visibility;
}
