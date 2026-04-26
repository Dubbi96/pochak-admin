package com.pochak.operation.vpu.dto;

import com.pochak.operation.vpu.entity.DeviceStatus;
import com.pochak.operation.vpu.entity.VpuDevice;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VpuDeviceResponse {

    private Long id;
    private Long contractId;
    private String serialNumber;
    private DeviceStatus status;
    private String firmwareVersion;
    private String location;
    private LocalDateTime lastHeartbeat;
    private LocalDateTime createdAt;

    public static VpuDeviceResponse from(VpuDevice device) {
        return VpuDeviceResponse.builder()
                .id(device.getId())
                .contractId(device.getContractId())
                .serialNumber(device.getSerialNumber())
                .status(device.getStatus())
                .firmwareVersion(device.getFirmwareVersion())
                .location(device.getLocation())
                .lastHeartbeat(device.getLastHeartbeat())
                .createdAt(device.getCreatedAt())
                .build();
    }
}
