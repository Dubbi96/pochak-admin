package com.pochak.content.streaming.service;

import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.streaming.StreamingProvider;
import com.pochak.content.streaming.dto.CameraView;
import com.pochak.content.streaming.dto.PlaybackResponse;
import com.pochak.content.streaming.dto.QualityLevel;
import com.pochak.content.streaming.dto.StreamInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Service that assembles a full PlaybackResponse from streaming infrastructure.
 * Acts as the single entry point for playback info across all content types.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentStreamService {

    private final StreamingProvider streamingProvider;
    private final VodAssetRepository vodAssetRepository;
    private final ClipAssetRepository clipAssetRepository;

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
                .durationSeconds(isLive ? null : fetchDuration(contentType, contentId))
                .qualityLevels(qualities)
                .cameraViews(cameras)
                .build();
    }

    /**
     * Fetches the actual duration from the asset metadata in the DB.
     * Falls back to a sensible default if the asset is not found.
     */
    private Long fetchDuration(String contentType, Long contentId) {
        if ("clip".equalsIgnoreCase(contentType)) {
            return clipAssetRepository.findById(contentId)
                    .map(clip -> clip.getDuration() != null ? clip.getDuration().longValue() : 120L)
                    .orElseGet(() -> {
                        log.warn("[ContentStream] ClipAsset not found for id={}, using default duration", contentId);
                        return 120L;
                    });
        }
        // vod
        return vodAssetRepository.findByIdAndDeletedAtIsNull(contentId)
                .map(vod -> vod.getDuration() != null && vod.getDuration() > 0
                        ? vod.getDuration().longValue()
                        : 5400L)
                .orElseGet(() -> {
                    log.warn("[ContentStream] VodAsset not found for id={}, using default duration", contentId);
                    return 5400L;
                });
    }
}
