package com.pochak.content.asset.dto.live;

import com.pochak.content.asset.entity.LiveAsset;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLiveAssetRequest {

    @NotNull(message = "matchId is required")
    private Long matchId;

    private Long cameraId;
    private String streamUrl;
    private String panoramaUrl;
    private String hdUrl;
    private String thumbnailUrl;

    @NotNull(message = "startTime is required")
    private LocalDateTime startTime;

    @Builder.Default
    private LiveAsset.Visibility visibility = LiveAsset.Visibility.PUBLIC;

    private LiveAsset.OwnerType ownerType;
    private Long ownerId;
    private String pixellotEventId;
}
