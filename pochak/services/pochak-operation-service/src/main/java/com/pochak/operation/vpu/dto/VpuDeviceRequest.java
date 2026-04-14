package com.pochak.operation.vpu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VpuDeviceRequest {

    @NotNull(message = "Contract ID is required")
    private Long contractId;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    private String firmwareVersion;

    private String location;
}
