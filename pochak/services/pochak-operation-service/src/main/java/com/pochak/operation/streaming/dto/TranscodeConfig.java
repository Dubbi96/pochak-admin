package com.pochak.operation.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranscodeConfig {

    private List<TranscodeProfile> profiles; // multi-bitrate

    @Builder.Default
    private String outputFormat = "hls"; // "hls", "dash"

    @Builder.Default
    private Integer segmentDuration = 4; // seconds

    @Builder.Default
    private Boolean enableDvr = true; // allow rewind on live

    @Builder.Default
    private Integer dvrWindowSeconds = 3600; // how far back (default 1hr)

    private Map<String, String> extraParams; // extensible
}
