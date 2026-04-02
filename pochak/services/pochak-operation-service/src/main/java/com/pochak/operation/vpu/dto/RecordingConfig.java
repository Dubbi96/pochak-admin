package com.pochak.operation.vpu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Recording configuration - extensible for future camera types.
 *
 * // TODO: Replace with real VPU/Camera/RTMP integration
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingConfig {

    private Long cameraId;

    /**
     * Resolution: "1080p", "4K"
     */
    private String resolution;

    /**
     * Frames per second: 30, 60
     */
    private Integer fps;

    /**
     * Video codec: "h264", "h265"
     */
    private String codec;

    /**
     * Output format: "hls", "rtmp"
     */
    private String outputFormat;

    /**
     * Extensible extra parameters for future camera-specific configurations.
     */
    private Map<String, String> extraParams;
}
