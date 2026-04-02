package com.pochak.operation.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngestStatus {

    private Long endpointId;
    private boolean receiving;
    private Integer currentBitrate;    // kbps
    private Integer currentFps;
    private String currentResolution;
    private Long framesReceived;
    private Long droppedFrames;
    private LocalDateTime lastFrameAt;
    private String health;   // GOOD, DEGRADED, POOR, OFFLINE
}
