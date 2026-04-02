package com.pochak.content.competition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMatchRequest {

    @NotNull(message = "Competition ID is required")
    private Long competitionId;

    private Long venueId;

    private Long sportId;

    @NotBlank(message = "Match name is required")
    private String name;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long homeTeamId;

    private Long awayTeamId;

    private Boolean isPanorama;

    private Boolean isScoreboard;

    private Boolean isDisplayed;
}
