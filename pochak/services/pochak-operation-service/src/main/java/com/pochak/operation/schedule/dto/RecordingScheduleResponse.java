package com.pochak.operation.schedule.dto;

import com.pochak.operation.schedule.entity.RecordingSchedule;
import com.pochak.operation.schedule.entity.RecordingScheduleStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RecordingScheduleResponse {

    private Long id;
    private Long userId;
    private Long venueId;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String memo;
    private RecordingScheduleStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RecordingScheduleResponse from(RecordingSchedule schedule) {
        return RecordingScheduleResponse.builder()
                .id(schedule.getId())
                .userId(schedule.getUserId())
                .venueId(schedule.getVenueId())
                .title(schedule.getTitle())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .memo(schedule.getMemo())
                .status(schedule.getStatus())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}
