package com.pochak.operation.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranscodeProfile {

    private String label;     // "1080p", "720p", "480p", "360p"
    private Integer width;
    private Integer height;
    private Integer bitrate;  // kbps
    private String codec;     // "h264", "h265"
}
