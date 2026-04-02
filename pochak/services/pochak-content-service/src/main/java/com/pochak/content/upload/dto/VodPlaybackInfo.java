package com.pochak.content.upload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VodPlaybackInfo {

    private Long vodAssetId;
    private String hlsUrl;
    private String dashUrl;         // optional
    private String mp4Url;          // progressive download (for clips)
    private Long durationSeconds;
    private List<QualityLevel> qualityLevels;
    private String thumbnailUrl;
    private List<String> previewThumbnails; // for seek preview (every 10s)
}
