package com.pochak.content.competition.dto;

import com.pochak.content.competition.entity.Competition;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class CompetitionDetailResponse {

    private Long id;
    private String name;
    private String shortName;
    private String nameEn;
    private String competitionType;
    private Long sportId;
    private String sportName;
    private String description;
    private String season;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailUrl;
    private String visibility;
    private String inviteCode;
    private Boolean isFree;
    private Boolean isDisplayed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CompetitionDetailResponse from(Competition competition) {
        return CompetitionDetailResponse.builder()
                .id(competition.getId())
                .name(competition.getName())
                .shortName(competition.getShortName())
                .nameEn(competition.getNameEn())
                .competitionType(competition.getCompetitionType() != null ? competition.getCompetitionType().name() : null)
                .sportId(competition.getSport().getId())
                .sportName(competition.getSport().getName())
                .description(competition.getDescription())
                .season(competition.getSeason())
                .status(competition.getStatus().name())
                .startDate(competition.getStartDate())
                .endDate(competition.getEndDate())
                .thumbnailUrl(competition.getThumbnailUrl())
                .visibility(competition.getVisibility() != null ? competition.getVisibility().name() : null)
                .inviteCode(competition.getInviteCode())
                .isFree(competition.getIsFree())
                .isDisplayed(competition.getIsDisplayed())
                .createdAt(competition.getCreatedAt())
                .updatedAt(competition.getUpdatedAt())
                .build();
    }
}
