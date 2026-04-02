package com.pochak.content.schedule.dto;

import com.pochak.content.competition.entity.Competition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodayCompetitionItem {

    private Long competitionId;
    private String name;
    private String shortName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String sportName;
    private String thumbnailUrl;

    public static TodayCompetitionItem from(Competition competition) {
        return TodayCompetitionItem.builder()
                .competitionId(competition.getId())
                .name(competition.getName())
                .shortName(competition.getShortName())
                .status(competition.getStatus().name())
                .startDate(competition.getStartDate())
                .endDate(competition.getEndDate())
                .sportName(competition.getSport() != null ? competition.getSport().getName() : null)
                .thumbnailUrl(competition.getThumbnailUrl())
                .build();
    }
}
