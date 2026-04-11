package com.pochak.operation.recording.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartRecordingSessionRequest {

    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    private Long cameraId;
}
