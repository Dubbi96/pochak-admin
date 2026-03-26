package com.pochak.content.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Unified playback response for all content types (LIVE, VOD, CLIP).
 * Returned by the content stream endpoint used by all platforms (mobile, web).
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaybackResponse {

    /** Primary HLS/DASH stream URL */
    private String streamUrl;

    /** Streaming protocol: "hls" | "dash" | "mp4" */
    private String protocol;

    /** Whether this is a live stream */
    private boolean isLive;

    /** Duration in seconds; null for live content */
    private Long durationSeconds;

    /** Available quality levels (adaptive bitrate variants) */
    private List<QualityLevel> qualityLevels;

    /** Available camera views (only populated for live content) */
    private List<CameraView> cameraViews;

    /** Thumbnail image URL for seek preview */
    private String thumbnailUrl;

    /** Poster image URL for pre-playback display */
    private String posterUrl;

    // Future: DRM config will be added here
}
