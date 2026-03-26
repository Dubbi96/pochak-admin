package com.pochak.content.streaming;

import com.pochak.content.streaming.dto.CameraView;
import com.pochak.content.streaming.dto.QualityLevel;
import com.pochak.content.streaming.dto.StreamInfo;

import java.util.List;

/**
 * Extensible streaming interface.
 * Current: returns static/mock URLs.
 * Future: integrates with VPU/CHU for real RTMP/HLS streams.
 *
 * // TODO: Replace with real VPU/Camera/RTMP integration
 */
public interface StreamingProvider {

    /**
     * Get the stream URL and configuration for a given content.
     */
    StreamInfo getStreamUrl(Long contentId, String contentType);

    /**
     * Get available camera views for a match.
     */
    List<CameraView> getAvailableCameras(Long matchId);

    /**
     * Get available quality levels for a given stream URL.
     */
    List<QualityLevel> getQualityLevels(String streamUrl);
}
