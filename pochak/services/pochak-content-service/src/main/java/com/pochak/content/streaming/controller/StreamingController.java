package com.pochak.content.streaming.controller;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.content.acl.service.VideoAclService;
import com.pochak.content.entitlement.dto.AccessCheckResponse;
import com.pochak.content.streaming.StreamingProvider;
import com.pochak.content.streaming.dto.CameraView;
import com.pochak.content.streaming.dto.PlaybackResponse;
import com.pochak.content.streaming.dto.QualityLevel;
import com.pochak.content.streaming.dto.StreamInfo;
import com.pochak.content.streaming.service.ContentStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Streaming API controller.
 * Delegates to StreamingProvider interface which can be swapped
 * between mock and real VPU/CHU implementations.
 *
 * // TODO: Replace with real VPU/Camera/RTMP integration
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class StreamingController {

    private final StreamingProvider streamingProvider;
    private final ContentStreamService contentStreamService;
    private final VideoAclService videoAclService;

    // ── Primary playback endpoint (used by all platforms) ──────────────

    /**
     * Get playback URL for a specific content item.
     * This is the main entry point for video playback across all platforms.
     * Returns HLS stream URL for LIVE, VOD, and CLIP content.
     *
     * Access control is enforced via VideoAclService (ABAC/CUG).
     * Unauthenticated requests (no X-User-Id) are only allowed for PUBLIC content.
     */
    @GetMapping("/contents/{contentType}/{contentId}/stream")
    public ApiResponse<PlaybackResponse> getContentStream(
            @PathVariable String contentType,
            @PathVariable Long contentId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        // 1. Validate contentType
        String normalizedType = contentType.toLowerCase();
        if (!normalizedType.equals("live") && !normalizedType.equals("vod") && !normalizedType.equals("clip")) {
            throw new IllegalArgumentException("Invalid contentType: " + contentType
                    + ". Must be one of: live, vod, clip");
        }

        // 2. Evaluate access control via VideoAclService (ABAC/CUG)
        AccessCheckResponse accessResult = videoAclService.evaluateAccess(normalizedType, contentId, userId);

        if (!accessResult.isHasAccess()) {
            log.warn("Stream access denied: contentType={}, contentId={}, userId={}, reason={}",
                    normalizedType, contentId, userId, accessResult.getReason());
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Access denied: " + accessResult.getReason());
        }

        log.debug("Stream access granted: contentType={}, contentId={}, userId={}, reason={}",
                normalizedType, contentId, userId, accessResult.getReason());

        // 3-4. Get playback info from service
        PlaybackResponse response = contentStreamService.getPlaybackInfo(normalizedType, contentId);
        return ApiResponse.success(response);
    }

    // ── Legacy low-level streaming endpoints ──────────────────────────

    @GetMapping("/streaming/{contentType}/{contentId}")
    public ApiResponse<StreamInfo> getStreamInfo(
            @PathVariable String contentType,
            @PathVariable Long contentId) {

        return ApiResponse.success(streamingProvider.getStreamUrl(contentId, contentType));
    }

    @GetMapping("/streaming/cameras/{matchId}")
    public ApiResponse<List<CameraView>> getAvailableCameras(@PathVariable Long matchId) {
        return ApiResponse.success(streamingProvider.getAvailableCameras(matchId));
    }

    @GetMapping("/streaming/quality")
    public ApiResponse<List<QualityLevel>> getQualityLevels(@RequestParam String url) {
        return ApiResponse.success(streamingProvider.getQualityLevels(url));
    }
}
