package com.pochak.operation.skylife.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChuRequest {

    private Long contractId;

    @NotBlank(message = "MAC address is required")
    private String macAddress;

    private String ipAddress;

    private String firmwareVersion;

    private String location;
}
