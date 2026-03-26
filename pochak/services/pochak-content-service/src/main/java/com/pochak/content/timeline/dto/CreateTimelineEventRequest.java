package com.pochak.content.timeline.dto;

import com.pochak.content.timeline.entity.MatchTimelineEvent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTimelineEventRequest {

    @NotNull(message = "eventType is required")
    private MatchTimelineEvent.EventType eventType;

    @NotNull(message = "timestampSeconds is required")
    private Integer timestampSeconds;

    private String description;

    private Long teamId;
}
