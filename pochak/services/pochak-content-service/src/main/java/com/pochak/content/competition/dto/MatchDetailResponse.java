package com.pochak.content.competition.dto;

import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.entity.MatchParticipant;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MatchDetailResponse {

    private Long id;
    private String title;
    private String description;
    private Long competitionId;
    private String competitionName;
    private Long sportId;
    private String sportName;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long venueId;
    private String venue;
    private String round;
    private Integer homeScore;
    private Integer awayScore;
    private Boolean isPanorama;
    private Boolean isScoreboard;
    private Boolean isDisplayed;
    private TeamInfo homeTeam;
    private TeamInfo awayTeam;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    public static class TeamInfo {
        private Long teamId;
        private String teamName;
        private String shortName;
        private String logoUrl;
        private Integer score;
    }

    public static MatchDetailResponse from(Match match, List<MatchParticipant> participants) {
        TeamInfo homeTeam = null;
        TeamInfo awayTeam = null;

        for (MatchParticipant p : participants) {
            TeamInfo info = TeamInfo.builder()
                    .teamId(p.getTeam().getId())
                    .teamName(p.getTeam().getName())
                    .shortName(p.getTeam().getShortName())
                    .logoUrl(p.getTeam().getLogoUrl())
                    .score(p.getScore())
                    .build();

            if (p.getSide() == MatchParticipant.Side.HOME) {
                homeTeam = info;
            } else if (p.getSide() == MatchParticipant.Side.AWAY) {
                awayTeam = info;
            }
        }

        return MatchDetailResponse.builder()
                .id(match.getId())
                .title(match.getTitle())
                .description(match.getDescription())
                .competitionId(match.getCompetition().getId())
                .competitionName(match.getCompetition().getName())
                .sportId(match.getSport() != null ? match.getSport().getId() : null)
                .sportName(match.getSport() != null ? match.getSport().getName() : null)
                .status(match.getStatus().name())
                .startTime(match.getStartTime())
                .endTime(match.getEndTime())
                .venueId(match.getVenueId())
                .venue(match.getVenue())
                .round(match.getRound())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .isPanorama(match.getIsPanorama())
                .isScoreboard(match.getIsScoreboard())
                .isDisplayed(match.getIsDisplayed())
                .homeTeam(homeTeam)
                .awayTeam(awayTeam)
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .build();
    }
}
