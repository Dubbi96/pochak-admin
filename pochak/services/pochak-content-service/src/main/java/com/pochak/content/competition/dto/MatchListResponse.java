package com.pochak.content.competition.dto;

import com.pochak.content.competition.entity.Match;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MatchListResponse {

    private Long id;
    private String title;
    private Long competitionId;
    private String competitionName;
    private Long sportId;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long venueId;
    private Integer homeScore;
    private Integer awayScore;
    private Boolean isPanorama;
    private Boolean isScoreboard;
    private Boolean isDisplayed;

    public static MatchListResponse from(Match match) {
        return MatchListResponse.builder()
                .id(match.getId())
                .title(match.getTitle())
                .competitionId(match.getCompetition().getId())
                .competitionName(match.getCompetition().getName())
                .sportId(match.getSport() != null ? match.getSport().getId() : null)
                .status(match.getStatus().name())
                .startTime(match.getStartTime())
                .endTime(match.getEndTime())
                .venueId(match.getVenueId())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .isPanorama(match.getIsPanorama())
                .isScoreboard(match.getIsScoreboard())
                .isDisplayed(match.getIsDisplayed())
                .build();
    }
}
