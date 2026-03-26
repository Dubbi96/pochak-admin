package com.pochak.operation.venue.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkCameraRequest {

    @NotNull(message = "Camera ID is required")
    private Long cameraId;

    private String position;
}
