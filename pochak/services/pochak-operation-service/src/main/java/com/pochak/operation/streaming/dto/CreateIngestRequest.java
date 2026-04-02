package com.pochak.operation.streaming.dto;

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
public class CreateIngestRequest {

    private Long matchId;

    @NotNull(message = "venueId is required")
    private Long venueId;

    private Long cameraId;

    @NotBlank(message = "cameraLabel is required")
    private String cameraLabel; // "AI", "PANO", "SIDE_A", "CAM", custom

    @Builder.Default
    private String resolution = "1080p"; // "1080p", "4K"

    @Builder.Default
    private Integer fps = 30; // 30, 60
}
