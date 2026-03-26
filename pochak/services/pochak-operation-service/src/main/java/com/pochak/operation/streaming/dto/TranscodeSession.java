package com.pochak.operation.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranscodeSession {

    private Long id;
    private Long ingestEndpointId;
    private String status;      // STARTING, LIVE, STOPPING, COMPLETED, ERROR
    private String hlsUrl;      // https://cdn.pochak.co.kr/live/{sessionId}/master.m3u8
    private String dashUrl;     // optional
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long durationSeconds;
}
