package com.pochak.operation.vpu;

import com.pochak.operation.vpu.dto.RecordingConfig;
import com.pochak.operation.vpu.dto.VpuStatus;

/**
 * VPU (Video Processing Unit) integration interface.
 * Stub implementation for Phase 4.
 * Will be replaced with real VPU SDK when hardware is integrated.
 *
 * // TODO: Replace with real VPU/Camera/RTMP integration
 */
public interface VpuService {

    /**
     * Get the current status of a VPU device attached to a camera.
     */
    VpuStatus getDeviceStatus(Long cameraId);

    /**
     * Start recording for a given session with the specified configuration.
     */
    void startRecording(Long sessionId, RecordingConfig config);

    /**
     * Stop recording for a given session.
     */
    void stopRecording(Long sessionId);

    /**
     * Get the RTMP ingest URL for a camera's VPU device.
     */
    String getRtmpIngestUrl(Long cameraId);
}
