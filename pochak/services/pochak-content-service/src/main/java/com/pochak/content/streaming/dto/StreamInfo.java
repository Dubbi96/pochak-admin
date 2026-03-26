package com.pochak.content.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreamInfo {

    private String url;

    /**
     * Streaming protocol: HLS, DASH, RTMP, MP4
     */
    private String protocol;

    private DrmConfig drmConfig;
}
