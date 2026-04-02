package com.pochak.operation.camera.dto;

import com.pochak.operation.camera.entity.Camera;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CameraDetailResponse {

    private Long id;
    private String name;
    private String serialNumber;
    private String model;
    private String manufacturer;
    private String pixellotDeviceId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CameraDetailResponse from(Camera camera) {
        return CameraDetailResponse.builder()
                .id(camera.getId())
                .name(camera.getName())
                .serialNumber(camera.getSerialNumber())
                .model(camera.getModel())
                .manufacturer(camera.getManufacturer())
                .pixellotDeviceId(camera.getPixellotDeviceId())
                .isActive(camera.getIsActive())
                .createdAt(camera.getCreatedAt())
                .updatedAt(camera.getUpdatedAt())
                .build();
    }
}
