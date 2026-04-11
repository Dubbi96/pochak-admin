package com.pochak.operation.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRecordingScheduleRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String memo;
}
