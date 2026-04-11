package com.pochak.content.competition.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.competition.dto.CompetitionDetailResponse;
import com.pochak.content.competition.dto.CompetitionListResponse;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.service.CompetitionService;
import com.pochak.content.competition.service.InviteCodeRateLimiter;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CompetitionControllerTest {

    @Mock
    private CompetitionService competitionService;

    @Mock
    private InviteCodeRateLimiter inviteCodeRateLimiter;

    @InjectMocks
    private CompetitionController competitionController;

    @Test
    @DisplayName("GET /competitions - should return competition list")
    void listCompetitions_success() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        CompetitionListResponse item = CompetitionListResponse.builder()
                .id(1L)
                .name("K리그 2026")
                .status("IN_PROGRESS")
                .startDate(LocalDate.of(2026, 3, 1))
                .build();
        Page<CompetitionListResponse> page = new PageImpl<>(List.of(item), pageable, 1);

        given(competitionService.listCompetitions(isNull(), isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        ApiResponse<List<CompetitionListResponse>> result =
                competitionController.listCompetitions(null, null, null, null, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getName()).isEqualTo("K리그 2026");
        assertThat(result.getMeta()).isNotNull();
        assertThat(result.getMeta().getTotalCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("GET /competitions - should filter by sportId")
    void listCompetitions_withSportIdFilter() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<CompetitionListResponse> page = new PageImpl<>(List.of(), pageable, 0);

        given(competitionService.listCompetitions(eq(1L), isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        ApiResponse<List<CompetitionListResponse>> result =
                competitionController.listCompetitions(1L, null, null, null, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isEmpty();
    }

    @Test
    @DisplayName("GET /competitions - should filter by status string")
    void listCompetitions_withStatusFilter() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<CompetitionListResponse> page = new PageImpl<>(List.of(), pageable, 0);

        given(competitionService.listCompetitions(isNull(), eq(Competition.CompetitionStatus.IN_PROGRESS), isNull(), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        ApiResponse<List<CompetitionListResponse>> result =
                competitionController.listCompetitions(null, "IN_PROGRESS", null, null, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        verify(competitionService).listCompetitions(isNull(), eq(Competition.CompetitionStatus.IN_PROGRESS), isNull(), isNull(), eq(pageable));
    }

    @Test
    @DisplayName("GET /competitions/{id} - should return competition detail")
    void getCompetition_success() {
        // given
        CompetitionDetailResponse detail = CompetitionDetailResponse.builder()
                .id(1L)
                .name("K리그 2026")
                .build();
        given(competitionService.getCompetitionDetail(1L)).willReturn(detail);

        // when
        ApiResponse<CompetitionDetailResponse> result = competitionController.getCompetition(1L);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().getId()).isEqualTo(1L);
        assertThat(result.getData().getName()).isEqualTo("K리그 2026");
    }
}
