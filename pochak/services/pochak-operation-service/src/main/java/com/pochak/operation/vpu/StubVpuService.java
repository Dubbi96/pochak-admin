package com.pochak.operation.vpu;

import com.pochak.operation.vpu.dto.RecordingConfig;
import com.pochak.operation.vpu.dto.VpuStatus;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Stub implementation of VpuService.
 * Returns mock data for development and testing purposes.
 *
 * Annotated with @ConditionalOnMissingBean so a real VpuService implementation
 * (backed by actual VPU hardware SDK) will automatically replace this when registered.
 */
@Slf4j
@Component
@ConditionalOnMissingBean(name = "realVpuService")
public class StubVpuService implements VpuService {

    @Value("${pochak.streaming.rtmp-base-url:rtmp://ingest.pochak.co.kr/live}")
    private String rtmpBaseUrl;

    @PostConstruct
    void logStubWarning() {
        log.warn("========================================================");
        log.warn(" Using STUB VPU service. No real VPU hardware connected.");
        log.warn(" Register a real VpuService bean to replace this stub.");
        log.warn("========================================================");
    }

    @Override
    public VpuStatus getDeviceStatus(Long cameraId) {
        log.info("[StubVpuService] getDeviceStatus called for cameraId={}", cameraId);
        return VpuStatus.builder()
                .cameraId(cameraId)
                .status("ONLINE")
                .firmwareVersion("stub-1.0.0")
                .cpuUsagePercent(0.0)
                .memoryUsagePercent(0.0)
                .lastHeartbeat(LocalDateTime.now())
                .build();
    }

    @Override
    public void startRecording(Long sessionId, RecordingConfig config) {
        log.info("[StubVpuService] startRecording called for sessionId={}, cameraId={}, resolution={}, fps={}, codec={}, outputFormat={}",
                sessionId,
                config.getCameraId(),
                config.getResolution(),
                config.getFps(),
                config.getCodec(),
                config.getOutputFormat());
        // No-op in stub mode
    }

    @Override
    public void stopRecording(Long sessionId) {
        log.info("[StubVpuService] stopRecording called for sessionId={}", sessionId);
        // No-op in stub mode
    }

    @Override
    public String getRtmpIngestUrl(Long cameraId) {
        log.info("[StubVpuService] getRtmpIngestUrl called for cameraId={}", cameraId);
        return rtmpBaseUrl + "/camera-" + cameraId;
    }
}
