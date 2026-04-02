package com.pochak.content.competition.dto;

import com.pochak.content.competition.entity.Competition;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class CompetitionListResponse {

    private Long id;
    private String name;
    private String shortName;
    private String competitionType;
    private Long sportId;
    private String sportName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String visibility;
    private Boolean isFree;
    private Boolean isDisplayed;

    public static CompetitionListResponse from(Competition competition) {
        return CompetitionListResponse.builder()
                .id(competition.getId())
                .name(competition.getName())
                .shortName(competition.getShortName())
                .competitionType(competition.getCompetitionType() != null ? competition.getCompetitionType().name() : null)
                .sportId(competition.getSport().getId())
                .sportName(competition.getSport().getName())
                .status(competition.getStatus().name())
                .startDate(competition.getStartDate())
                .endDate(competition.getEndDate())
                .visibility(competition.getVisibility() != null ? competition.getVisibility().name() : null)
                .isFree(competition.getIsFree())
                .isDisplayed(competition.getIsDisplayed())
                .build();
    }
}
