package com.pochak.operation.camera.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCameraRequest {

    @NotBlank(message = "Camera name is required")
    private String name;

    private String serialNumber;
    private String model;
    private String manufacturer;
    private String pixellotDeviceId;
}
