package com.pochak.content.asset.dto.live;

import com.pochak.content.asset.entity.LiveAsset;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateLiveAssetRequest {

    private Long cameraId;
    private String streamUrl;
    private String panoramaUrl;
    private String hdUrl;
    private String thumbnailUrl;
    private LiveAsset.Visibility visibility;
    private LocalDateTime startTime;
}
