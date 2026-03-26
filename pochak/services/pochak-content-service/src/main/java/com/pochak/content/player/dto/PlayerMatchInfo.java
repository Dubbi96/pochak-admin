package com.pochak.content.player.dto;

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
public class PlayerMatchInfo {

    private Long matchId;
    private String matchName;
    private String round;
    private LocalDateTime broadcastTime;
    private String competitionName;
    private TeamInfo homeTeam;
    private TeamInfo awayTeam;
    private String score;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamInfo {
        private Long teamId;
        private String name;
        private String shortName;
        private String logoUrl;
        private Integer score;
    }

    public static PlayerMatchInfo from(Match match) {
        if (match == null) return null;

        PlayerMatchInfoBuilder builder = PlayerMatchInfo.builder()
                .matchId(match.getId())
                .matchName(match.getTitle())
                .round(match.getRound())
                .broadcastTime(match.getStartTime());

        if (match.getCompetition() != null) {
            builder.competitionName(match.getCompetition().getName());
        }

        String scoreText = null;
        if (match.getHomeScore() != null && match.getAwayScore() != null) {
            scoreText = match.getHomeScore() + " : " + match.getAwayScore();
        }
        builder.score(scoreText);

        List<MatchParticipant> participants = match.getParticipants();
        if (participants != null) {
            for (MatchParticipant p : participants) {
                TeamInfo team = TeamInfo.builder()
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
