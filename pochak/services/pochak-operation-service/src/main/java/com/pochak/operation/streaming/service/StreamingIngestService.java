package com.pochak.operation.streaming.service;

import com.pochak.operation.streaming.dto.*;

import java.util.List;

/**
 * Streaming Ingest Service - manages RTMP ingest -> HLS transcoding pipeline.
 *
 * Flow: Camera/OBS/VPU -> RTMP Ingest URL -> Transcoder -> HLS/DASH -> CDN -> Player
 *
 * Current: Stub implementation returning mock URLs.
 * TODO: Replace with real RTMP server integration (Nginx-RTMP, MediaMTX, AWS IVS, etc.)
 */
public interface StreamingIngestService {

    /** Generate unique RTMP ingest URL for a streaming session */
    IngestEndpoint createIngestEndpoint(CreateIngestRequest request);

    /** Start transcoding pipeline (RTMP -> HLS multi-bitrate) */
    TranscodeSession startTranscoding(Long ingestEndpointId, TranscodeConfig config);

    /** Stop transcoding and finalize stream */
    void stopTranscoding(Long transcodeSessionId);

    /** Get current ingest status (receiving frames? bitrate? health?) */
    IngestStatus getIngestStatus(Long ingestEndpointId);

    /** Get playback URL (HLS/DASH) for a live stream */
    PlaybackInfo getPlaybackUrl(Long transcodeSessionId);

    /** List all active ingest endpoints */
    List<IngestEndpoint> getActiveEndpoints();
}
