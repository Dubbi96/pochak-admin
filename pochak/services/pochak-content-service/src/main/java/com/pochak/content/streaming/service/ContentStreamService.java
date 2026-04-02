package com.pochak.content.streaming.service;

import com.pochak.content.streaming.StreamingProvider;
import com.pochak.content.streaming.dto.CameraView;
import com.pochak.content.streaming.dto.PlaybackResponse;
import com.pochak.content.streaming.dto.QualityLevel;
import com.pochak.content.streaming.dto.StreamInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Service that assembles a full PlaybackResponse from streaming infrastructure.
 * Acts as the single entry point for playback info across all content types.
 */
@Service
@RequiredArgsConstructor
public class ContentStreamService {

    private final StreamingProvider streamingProvider;

    /**
     * Build a complete PlaybackResponse for the given content.
     *
     * @param contentType "live", "vod", or "clip"
     * @param contentId   content identifier
     * @return PlaybackResponse with stream URL, quality levels, and camera views
     */
    public PlaybackResponse getPlaybackInfo(String contentType, Long contentId) {
        // Get stream info from provider
        StreamInfo streamInfo = streamingProvider.getStreamUrl(contentId, contentType);

        // Get camera views only for live content
        boolean isLive = "live".equalsIgnoreCase(contentType);
        List<CameraView> cameras = isLive
                ? streamingProvider.getAvailableCameras(contentId)
                : Collections.emptyList();

        // Get quality levels
        List<QualityLevel> qualities = streamingProvider.getQualityLevels(streamInfo.getUrl());

        return PlaybackResponse.builder()
                .streamUrl(streamInfo.getUrl())
                .protocol(streamInfo.getProtocol().toLowerCase())
                .isLive(isLive)
                .durationSeconds(isLive ? null : estimateDuration(contentType))
                .qualityLevels(qualities)
                .cameraViews(cameras)
                .build();
    }

    /**
     * Placeholder duration estimation.
     * In a real implementation this would come from asset metadata.
     */
    private Long estimateDuration(String contentType) {
        // TODO: fetch actual duration from content metadata / asset DB
        return "clip".equalsIgnoreCase(contentType) ? 120L : 5400L;
    }
}
