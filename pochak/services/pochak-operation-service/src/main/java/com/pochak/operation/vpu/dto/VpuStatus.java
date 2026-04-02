package com.pochak.operation.vpu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VpuStatus {

    private Long cameraId;

    /**
     * Device status: ONLINE, OFFLINE, RECORDING, ERROR
     */
    private String status;

    private String firmwareVersion;

    private Double cpuUsagePercent;

    private Double memoryUsagePercent;

    private LocalDateTime lastHeartbeat;
}
