package com.pochak.operation.skylife.dto;

import com.pochak.operation.skylife.entity.CameraHubUnit;
import com.pochak.operation.skylife.entity.ChuStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChuResponse {

    private Long id;
    private Long contractId;
    private String macAddress;
    private String ipAddress;
    private ChuStatus status;
    private String firmwareVersion;
    private String location;
    private LocalDateTime lastConnectedAt;
    private LocalDateTime createdAt;

    public static ChuResponse from(CameraHubUnit chu) {
        return ChuResponse.builder()
                .id(chu.getId())
                .contractId(chu.getContractId())
                .macAddress(chu.getMacAddress())
                .ipAddress(chu.getIpAddress())
                .status(chu.getStatus())
                .firmwareVersion(chu.getFirmwareVersion())
                .location(chu.getLocation())
                .lastConnectedAt(chu.getLastConnectedAt())
                .createdAt(chu.getCreatedAt())
                .build();
    }
}
