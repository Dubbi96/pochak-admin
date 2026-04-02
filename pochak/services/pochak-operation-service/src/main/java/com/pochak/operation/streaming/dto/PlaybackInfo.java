package com.pochak.operation.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaybackInfo {

    private String hlsUrl;
    private String dashUrl;
    private List<QualityLevel> qualityLevels;
    private boolean isLive;
    private boolean dvrEnabled;
    private Integer dvrWindowSeconds;
}
