package com.pochak.content.home.dto;

import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
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
public class ContentCard {

    private Long id;
    private ContentType type;
    private String title;
    private String thumbnailUrl;
    private Integer duration;
    private Integer viewCount;
    private String badge;
    private MatchInfo matchInfo;
    private List<String> tags;

    public enum ContentType {
        LIVE, VOD, CLIP
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchInfo {
        private Long matchId;
        private String homeTeam;
        private String homeTeamLogo;
        private String awayTeam;
        private String awayTeamLogo;
        private String competitionName;
        private LocalDateTime date;
        private Integer homeScore;
        private Integer awayScore;
    }

    public static ContentCard fromLive(LiveAsset live) {
        ContentCardBuilder builder = ContentCard.builder()
                .id(live.getId())
                .type(ContentType.LIVE)
                .thumbnailUrl(live.getThumbnailUrl())
                .viewCount(live.getViewCount())
                .badge("LIVE");

        if (live.getMatch() != null) {
            builder.title(live.getMatch().getTitle());
            builder.matchInfo(buildMatchInfo(live.getMatch()));
        }

        return builder.build();
    }

    public static ContentCard fromVod(VodAsset vod) {
        ContentCardBuilder builder = ContentCard.builder()
                .id(vod.getId())
                .type(ContentType.VOD)
                .title(vod.getTitle())
                .thumbnailUrl(vod.getThumbnailUrl())
                .duration(vod.getDuration())
                .viewCount(vod.getViewCount())
                .badge(vod.getVisibility() == LiveAsset.Visibility.PUBLIC ? "FREE" : "VOD");

        if (vod.getMatch() != null) {
            builder.matchInfo(buildMatchInfo(vod.getMatch()));
        }

        return builder.build();
    }

    public static ContentCard fromClip(ClipAsset clip) {
        ContentCardBuilder builder = ContentCard.builder()
                .id(clip.getId())
                .type(ContentType.CLIP)
                .title(clip.getTitle())
                .thumbnailUrl(clip.getThumbnailUrl())
                .duration(clip.getDuration())
                .viewCount(clip.getViewCount())
                .badge("CLIP");

        if (clip.getMatch() != null) {
            builder.matchInfo(buildMatchInfo(clip.getMatch()));
        }

        return builder.build();
    }

    private static MatchInfo buildMatchInfo(Match match) {
        MatchInfo.MatchInfoBuilder infoBuilder = MatchInfo.builder()
                .matchId(match.getId())
                .date(match.getStartTime())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore());

        if (match.getCompetition() != null) {
            infoBuilder.competitionName(match.getCompetition().getName());
        }

        if (match.getParticipants() != null) {
            for (MatchParticipant p : match.getParticipants()) {
                if (p.getSide() == MatchParticipant.Side.HOME && p.getTeam() != null) {
                    infoBuilder.homeTeam(p.getTeam().getName());
                    infoBuilder.homeTeamLogo(p.getTeam().getLogoUrl());
                } else if (p.getSide() == MatchParticipant.Side.AWAY && p.getTeam() != null) {
                    infoBuilder.awayTeam(p.getTeam().getName());
                    infoBuilder.awayTeamLogo(p.getTeam().getLogoUrl());
                }
            }
        }

        return infoBuilder.build();
    }
}
