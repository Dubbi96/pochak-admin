package com.pochak.content.schedule.dto;

import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.entity.MatchParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchScheduleItem {

    private Long matchId;
    private String name;
    private String status;
    private LocalDateTime startTime;
    private TeamSummary homeTeam;
    private TeamSummary awayTeam;
    private String competitionName;
    private String venue;
    private String round;
    private Boolean hasLive;
    private Boolean hasVod;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamSummary {
        private Long teamId;
        private String name;
        private String shortName;
        private String logoUrl;
        private Integer score;
    }

    public static MatchScheduleItem from(Match match, boolean hasLive, boolean hasVod) {
        MatchScheduleItemBuilder builder = MatchScheduleItem.builder()
                .matchId(match.getId())
                .name(match.getTitle())
                .status(match.getStatus().name())
                .startTime(match.getStartTime())
                .venue(match.getVenue())
                .round(match.getRound())
                .hasLive(hasLive)
                .hasVod(hasVod);

        if (match.getCompetition() != null) {
            builder.competitionName(match.getCompetition().getName());
        }

        List<MatchParticipant> participants = match.getParticipants();
        if (participants != null) {
            for (MatchParticipant p : participants) {
                TeamSummary team = TeamSummary.builder()
                        .teamId(p.getTeam().getId())
                        .name(p.getTeam().getName())
                        .shortName(p.getTeam().getShortName())
                        .logoUrl(p.getTeam().getLogoUrl())
                        .score(p.getScore())
                        .build();

                if (p.getSide() == MatchParticipant.Side.HOME) {
                    builder.homeTeam(team);
                } else if (p.getSide() == MatchParticipant.Side.AWAY) {
                    builder.awayTeam(team);
                }
            }
        }

        return builder.build();
    }
}
