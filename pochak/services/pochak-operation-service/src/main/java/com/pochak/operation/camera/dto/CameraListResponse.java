package com.pochak.operation.camera.dto;

import com.pochak.operation.camera.entity.Camera;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CameraListResponse {

    private Long id;
    private String name;
    private String serialNumber;
    private String model;
    private String manufacturer;
    private Boolean isActive;

    public static CameraListResponse from(Camera camera) {
        return CameraListResponse.builder()
                .id(camera.getId())
                .name(camera.getName())
                .serialNumber(camera.getSerialNumber())
                .model(camera.getModel())
                .manufacturer(camera.getManufacturer())
                .isActive(camera.getIsActive())
                .build();
    }
}
