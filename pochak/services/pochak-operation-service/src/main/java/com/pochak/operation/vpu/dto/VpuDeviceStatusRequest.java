package com.pochak.operation.vpu.dto;

import com.pochak.operation.vpu.entity.DeviceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VpuDeviceStatusRequest {

    @NotNull(message = "Status is required")
    private DeviceStatus status;
}
