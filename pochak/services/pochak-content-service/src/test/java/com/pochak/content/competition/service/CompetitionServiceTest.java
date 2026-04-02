package com.pochak.content.competition.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.competition.dto.*;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.CompetitionVisibility;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.sport.repository.SportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CompetitionServiceTest {

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private SportRepository sportRepository;

    @InjectMocks
    private CompetitionService competitionService;

    private Sport testSport;
    private Competition testCompetition;

    @BeforeEach
    void setUp() {
        testSport = Sport.builder()
                .id(1L)
                .name("Football")
                .nameEn("Football")
                .code("SOCCER")
                .active(true)
                .displayOrder(1)
                .tags(new ArrayList<>())
                .build();

        testCompetition = Competition.builder()
                .id(1L)
                .name("K League 2025")
                .shortName("K League")
                .competitionType(Competition.CompetitionType.LEAGUE)
                .sport(testSport)
                .status(Competition.CompetitionStatus.SCHEDULED)
                .startDate(LocalDate.of(2025, 3, 1))
                .endDate(LocalDate.of(2025, 11, 30))
                .description("Korean Professional Football League")
                .isFree(false)
                .isDisplayed(true)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should list competitions with pagination")
    void testListCompetitions() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Competition> page = new PageImpl<>(List.of(testCompetition), pageable, 1);
        given(competitionRepository.findWithFiltersAndVisibility(
                isNull(), isNull(), isNull(), isNull(), eq(CompetitionVisibility.PUBLIC), eq(pageable)))
                .willReturn(page);

        // when
        Page<CompetitionListResponse> result = competitionService.listCompetitions(
                null, null, null, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("K League 2025");
        assertThat(result.getContent().get(0).getSportName()).isEqualTo("Football");
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should create a competition successfully")
    void testCreateCompetition() {
        // given
        CreateCompetitionRequest request = CreateCompetitionRequest.builder()
                .name("Champions Cup 2025")
                .shortName("CC 2025")
                .competitionType("TOURNAMENT")
                .sportId(1L)
                .startDate(LocalDate.of(2025, 6, 1))
                .endDate(LocalDate.of(2025, 8, 31))
                .description("Champions Cup Tournament")
                .isFree(true)
                .isDisplayed(true)
                .build();

        given(sportRepository.findById(1L)).willReturn(Optional.of(testSport));

        Competition savedCompetition = Competition.builder()
                .id(2L)
                .name("Champions Cup 2025")
                .shortName("CC 2025")
                .competitionType(Competition.CompetitionType.TOURNAMENT)
                .sport(testSport)
                .status(Competition.CompetitionStatus.SCHEDULED)
                .startDate(LocalDate.of(2025, 6, 1))
                .endDate(LocalDate.of(2025, 8, 31))
                .description("Champions Cup Tournament")
                .isFree(true)
                .isDisplayed(true)
                .active(true)
                .build();
        given(competitionRepository.save(any(Competition.class))).willReturn(savedCompetition);

        // when
        CompetitionDetailResponse result = competitionService.createCompetition(request);

        // then
        assertThat(result.getName()).isEqualTo("Champions Cup 2025");
        assertThat(result.getShortName()).isEqualTo("CC 2025");
        assertThat(result.getCompetitionType()).isEqualTo("TOURNAMENT");
        assertThat(result.getSportName()).isEqualTo("Football");
        assertThat(result.getIsFree()).isTrue();
    }

    @Test
    @DisplayName("Should filter competitions by status")
    void testFilterByStatus() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Competition inProgressCompetition = Competition.builder()
                .id(3L)
                .name("Active League")
                .sport(testSport)
                .status(Competition.CompetitionStatus.ONGOING)
                .isDisplayed(true)
                .active(true)
                .build();

        Page<Competition> page = new PageImpl<>(List.of(inProgressCompetition), pageable, 1);
        given(competitionRepository.findWithFiltersAndVisibility(
                isNull(), eq(Competition.CompetitionStatus.ONGOING), isNull(), isNull(),
                eq(CompetitionVisibility.PUBLIC), eq(pageable)))
                .willReturn(page);

        // when
        Page<CompetitionListResponse> result = competitionService.listCompetitions(
                null, Competition.CompetitionStatus.ONGOING, null, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo("ONGOING");
    }

    @Test
    @DisplayName("Should throw exception when sport not found on create")
    void testCreateCompetition_sportNotFound() {
        // given
        CreateCompetitionRequest request = CreateCompetitionRequest.builder()
                .name("Test")
                .sportId(999L)
                .build();

        given(sportRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> competitionService.createCompetition(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Sport not found");
    }

    @Test
    @DisplayName("Should soft delete a competition")
    void testDeleteCompetition() {
        // given
        given(competitionRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(testCompetition));

        // when
        competitionService.deleteCompetition(1L);

        // then
        assertThat(testCompetition.getActive()).isFalse();
    }
}
