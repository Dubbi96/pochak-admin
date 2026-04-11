package com.pochak.operation.recording.dto;

import com.pochak.operation.recording.entity.RecordingSession;
import com.pochak.operation.recording.entity.RecordingSessionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RecordingSessionResponse {

    private Long id;
    private Long scheduleId;
    private Long cameraId;
    private Long userId;
    private Long venueId;
    private RecordingSessionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime stoppedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RecordingSessionResponse from(RecordingSession session) {
        return RecordingSessionResponse.builder()
                .id(session.getId())
                .scheduleId(session.getScheduleId())
                .cameraId(session.getCameraId())
                .userId(session.getUserId())
                .venueId(session.getVenueId())
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .stoppedAt(session.getStoppedAt())
                .completedAt(session.getCompletedAt())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }
}
