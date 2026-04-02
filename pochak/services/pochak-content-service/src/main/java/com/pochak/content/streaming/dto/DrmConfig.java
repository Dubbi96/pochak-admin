package com.pochak.content.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrmConfig {

    /**
     * DRM type: WIDEVINE, FAIRPLAY, NONE
     */
    private String type;

    private String licenseUrl;

    private String certificateUrl;
}
