package com.pochak.content.home.dto;

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
public class CompetitionBanner {

    private Long competitionId;
    private String name;
    private String shortName;
    private String thumbnailUrl;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String sportName;
    private Boolean isFree;

    public static CompetitionBanner from(Competition competition) {
        return CompetitionBanner.builder()
                .competitionId(competition.getId())
                .name(competition.getName())
                .shortName(competition.getShortName())
                .thumbnailUrl(competition.getThumbnailUrl())
                .status(competition.getStatus().name())
                .startDate(competition.getStartDate())
                .endDate(competition.getEndDate())
                .sportName(competition.getSport() != null ? competition.getSport().getName() : null)
                .isFree(competition.getIsFree())
                .build();
    }
}
