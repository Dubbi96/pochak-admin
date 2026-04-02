package com.pochak.operation.streaming.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.streaming.dto.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Stub implementation of StreamingIngestService for development/testing.
 * Returns mock RTMP URLs and HLS playback URLs, tracks state in-memory.
 *
 * Activated when pochak.streaming.ingest=stub (or not set at all).
 * Replace with real RTMP server integration for production:
 *  - Nginx-RTMP Module for self-hosted
 *  - MediaMTX for lightweight self-hosted
 *  - AWS IVS for managed cloud
 *  - Wowza Streaming Engine for enterprise
 */
@Service
@ConditionalOnProperty(name = "pochak.streaming.ingest", havingValue = "stub", matchIfMissing = true)
@Slf4j
public class StubStreamingIngestService implements StreamingIngestService {

    @Value("${pochak.streaming.rtmp-base-url:rtmp://ingest.pochak.co.kr/live}")
    private String rtmpBaseUrl;

    @Value("${pochak.streaming.cdn-base-url:https://cdn.pochak.co.kr}")
    private String cdnBaseUrl;

    @PostConstruct
    void logStubWarning() {
        log.warn("========================================================");
        log.warn(" Using STUB streaming ingest service.");
        log.warn(" Set pochak.streaming.ingest for production.");
        log.warn("========================================================");
    }

    private final ConcurrentHashMap<Long, IngestEndpoint> endpoints = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, TranscodeSession> sessions = new ConcurrentHashMap<>();
    private final AtomicLong endpointIdSeq = new AtomicLong(1);
    private final AtomicLong sessionIdSeq = new AtomicLong(1);

    @Override
    public IngestEndpoint createIngestEndpoint(CreateIngestRequest request) {
        Long id = endpointIdSeq.getAndIncrement();
        String streamKey = UUID.randomUUID().toString().replace("-", "");

        IngestEndpoint endpoint = IngestEndpoint.builder()
                .id(id)
                .rtmpUrl(rtmpBaseUrl + "/" + streamKey)
                .streamKey(streamKey)
                .status("CREATED")
                .matchId(request.getMatchId())
                .cameraId(request.getCameraId())
                .cameraLabel(request.getCameraLabel())
                .createdAt(LocalDateTime.now())
                .build();

        endpoints.put(id, endpoint);
        log.info("[STUB] Created ingest endpoint id={}, streamKey={}, cameraLabel={}",
                id, streamKey, request.getCameraLabel());
        return endpoint;
    }

    @Override
    public TranscodeSession startTranscoding(Long ingestEndpointId, TranscodeConfig config) {
        IngestEndpoint endpoint = endpoints.get(ingestEndpointId);
        if (endpoint == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Ingest endpoint not found: " + ingestEndpointId);
        }

        // Simulate endpoint receiving frames
        IngestEndpoint receiving = IngestEndpoint.builder()
                .id(endpoint.getId())
                .rtmpUrl(endpoint.getRtmpUrl())
                .streamKey(endpoint.getStreamKey())
                .status("RECEIVING")
                .matchId(endpoint.getMatchId())
                .cameraId(endpoint.getCameraId())
                .cameraLabel(endpoint.getCameraLabel())
                .createdAt(endpoint.getCreatedAt())
                .lastFrameAt(LocalDateTime.now())
                .build();
        endpoints.put(ingestEndpointId, receiving);

        Long sessionId = sessionIdSeq.getAndIncrement();
        String hlsUrl = cdnBaseUrl + "/live/" + sessionId + "/master.m3u8";

        TranscodeSession session = TranscodeSession.builder()
                .id(sessionId)
                .ingestEndpointId(ingestEndpointId)
                .status("LIVE")
                .hlsUrl(hlsUrl)
                .dashUrl(cdnBaseUrl + "/live/" + sessionId + "/manifest.mpd")
                .startedAt(LocalDateTime.now())
                .build();

        sessions.put(sessionId, session);
        log.info("[STUB] Started transcoding session id={}, endpoint={}, hlsUrl={}",
                sessionId, ingestEndpointId, hlsUrl);
        return session;
    }

    @Override
    public void stopTranscoding(Long transcodeSessionId) {
        TranscodeSession session = sessions.get(transcodeSessionId);
        if (session == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Transcode session not found: " + transcodeSessionId);
        }

        LocalDateTime now = LocalDateTime.now();
        long duration = session.getStartedAt() != null
                ? ChronoUnit.SECONDS.between(session.getStartedAt(), now)
                : 0;

        session.setStatus("COMPLETED");
        session.setEndedAt(now);
        session.setDurationSeconds(duration);

        // Also stop the endpoint
        IngestEndpoint endpoint = endpoints.get(session.getIngestEndpointId());
        if (endpoint != null) {
            IngestEndpoint stopped = IngestEndpoint.builder()
                    .id(endpoint.getId())
                    .rtmpUrl(endpoint.getRtmpUrl())
                    .streamKey(endpoint.getStreamKey())
                    .status("STOPPED")
                    .matchId(endpoint.getMatchId())
                    .cameraId(endpoint.getCameraId())
                    .cameraLabel(endpoint.getCameraLabel())
                    .createdAt(endpoint.getCreatedAt())
                    .lastFrameAt(endpoint.getLastFrameAt())
                    .build();
            endpoints.put(endpoint.getId(), stopped);
        }

        log.info("[STUB] Stopped transcoding session id={}, duration={}s", transcodeSessionId, duration);
    }

    @Override
    public IngestStatus getIngestStatus(Long ingestEndpointId) {
        IngestEndpoint endpoint = endpoints.get(ingestEndpointId);
        if (endpoint == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Ingest endpoint not found: " + ingestEndpointId);
        }

        boolean isReceiving = "RECEIVING".equals(endpoint.getStatus());

        // Simulate realistic metrics
        return IngestStatus.builder()
                .endpointId(ingestEndpointId)
                .receiving(isReceiving)
                .currentBitrate(isReceiving ? 4500 : 0)
                .currentFps(isReceiving ? 30 : 0)
                .currentResolution(isReceiving ? "1920x1080" : null)
                .framesReceived(isReceiving ? 54000L : 0L)
                .droppedFrames(isReceiving ? 12L : 0L)
                .lastFrameAt(endpoint.getLastFrameAt())
                .health(isReceiving ? "GOOD" : "OFFLINE")
                .build();
    }

    @Override
    public PlaybackInfo getPlaybackUrl(Long transcodeSessionId) {
        TranscodeSession session = sessions.get(transcodeSessionId);
        if (session == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Transcode session not found: " + transcodeSessionId);
        }

        boolean isLive = "LIVE".equals(session.getStatus());

        return PlaybackInfo.builder()
                .hlsUrl(session.getHlsUrl())
                .dashUrl(session.getDashUrl())
                .qualityLevels(List.of(
                        QualityLevel.builder().label("1080p").width(1920).height(1080).bitrate(4500).build(),
                        QualityLevel.builder().label("720p").width(1280).height(720).bitrate(2500).build(),
                        QualityLevel.builder().label("480p").width(854).height(480).bitrate(1200).build(),
                        QualityLevel.builder().label("360p").width(640).height(360).bitrate(600).build()
                ))
                .isLive(isLive)
                .dvrEnabled(true)
                .dvrWindowSeconds(3600)
                .build();
    }

    @Override
    public List<IngestEndpoint> getActiveEndpoints() {
        return endpoints.values().stream()
                .filter(e -> !"STOPPED".equals(e.getStatus()))
                .toList();
    }
}
