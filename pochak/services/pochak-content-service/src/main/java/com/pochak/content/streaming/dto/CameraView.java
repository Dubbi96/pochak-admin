package com.pochak.content.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CameraView {

    private Long id;

    /**
     * Camera label: AI, PANO, SIDE_A, CAM, etc.
     */
    private String label;

    private String streamUrl;

    private boolean isDefault;
}
