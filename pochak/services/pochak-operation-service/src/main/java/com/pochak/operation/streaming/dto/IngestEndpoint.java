package com.pochak.operation.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngestEndpoint {

    private Long id;
    private String rtmpUrl;          // rtmp://ingest.pochak.co.kr/live/{streamKey}
    private String streamKey;        // unique key per session
    private String status;           // CREATED, RECEIVING, ERROR, STOPPED
    private Long matchId;
    private Long cameraId;
    private String cameraLabel;
    private LocalDateTime createdAt;
    private LocalDateTime lastFrameAt;
}
