package com.pochak.content.competition.dto;

import com.pochak.content.competition.entity.Competition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCompetitionRequest {

    @NotBlank(message = "Competition name is required")
    private String name;

    private String shortName;

    private String competitionType;

    @NotNull(message = "Sport ID is required")
    private Long sportId;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    private String visibility;

    private Boolean isFree;

    private Boolean isDisplayed;
}
