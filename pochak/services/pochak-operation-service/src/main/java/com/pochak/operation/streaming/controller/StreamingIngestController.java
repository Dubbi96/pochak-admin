package com.pochak.operation.streaming.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.operation.streaming.dto.*;
import com.pochak.operation.streaming.service.StreamingIngestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/streaming/ingest")
@RequiredArgsConstructor
public class StreamingIngestController {

    private final StreamingIngestService streamingIngestService;

    /** Create new RTMP ingest endpoint */
    @PostMapping("/endpoints")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<IngestEndpoint> createEndpoint(
            @Valid @RequestBody CreateIngestRequest request) {
        return ApiResponse.success(streamingIngestService.createIngestEndpoint(request));
    }

    /** List all active ingest endpoints */
    @GetMapping("/endpoints")
    public ApiResponse<List<IngestEndpoint>> listActiveEndpoints() {
        return ApiResponse.success(streamingIngestService.getActiveEndpoints());
    }

    /** Get ingest health/status for a specific endpoint */
    @GetMapping("/endpoints/{id}/status")
    public ApiResponse<IngestStatus> getEndpointStatus(@PathVariable Long id) {
        return ApiResponse.success(streamingIngestService.getIngestStatus(id));
    }

    /** Start transcoding pipeline (RTMP -> HLS multi-bitrate) */
    @PostMapping("/transcode/start")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TranscodeSession> startTranscoding(
            @Valid @RequestBody StartTranscodeRequest request) {
        return ApiResponse.success(
                streamingIngestService.startTranscoding(
                        request.getIngestEndpointId(),
                        request.getConfig()));
    }

    /** Stop transcoding and finalize stream */
    @PostMapping("/transcode/{id}/stop")
    public ApiResponse<Void> stopTranscoding(@PathVariable Long id) {
        streamingIngestService.stopTranscoding(id);
        return ApiResponse.success(null);
    }

    /** Get playback URLs (HLS/DASH) for a transcode session */
    @GetMapping("/playback/{sessionId}")
    public ApiResponse<PlaybackInfo> getPlaybackUrl(@PathVariable Long sessionId) {
        return ApiResponse.success(streamingIngestService.getPlaybackUrl(sessionId));
    }
}
