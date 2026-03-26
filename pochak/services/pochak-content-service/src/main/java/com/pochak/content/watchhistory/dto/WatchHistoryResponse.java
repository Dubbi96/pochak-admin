package com.pochak.content.watchhistory.dto;

import com.pochak.content.history.entity.ViewHistory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WatchHistoryResponse {

    private Long id;
    private String assetType;
    private Long assetId;
    private Integer watchDurationSeconds;
    private Integer lastPositionSeconds;
    private Boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WatchHistoryResponse from(ViewHistory entity) {
        return WatchHistoryResponse.builder()
                .id(entity.getId())
                .assetType(entity.getAssetType())
                .assetId(entity.getAssetId())
                .watchDurationSeconds(entity.getWatchDurationSeconds())
                .lastPositionSeconds(entity.getLastPositionSeconds())
                .completed(entity.getCompleted())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
