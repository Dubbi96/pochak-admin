package com.pochak.content.timeline.dto;

import com.pochak.content.timeline.entity.MatchTimelineEvent;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TimelineEventResponse {

    private Long id;
    private String contentType;
    private Long contentId;
    private MatchTimelineEvent.EventType eventType;
    private Integer timestampSeconds;
    private String description;
    private Long teamId;
    private LocalDateTime createdAt;

    public static TimelineEventResponse from(MatchTimelineEvent entity) {
        return TimelineEventResponse.builder()
                .id(entity.getId())
                .contentType(entity.getContentType())
                .contentId(entity.getContentId())
                .eventType(entity.getEventType())
                .timestampSeconds(entity.getTimestampSeconds())
                .description(entity.getDescription())
                .teamId(entity.getTeamId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
