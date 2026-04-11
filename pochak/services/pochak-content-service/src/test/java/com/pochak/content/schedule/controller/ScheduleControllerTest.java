package com.pochak.content.schedule.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.schedule.dto.TodayCompetitionItem;
import com.pochak.content.schedule.service.ScheduleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ScheduleControllerTest {

    @Mock
    private ScheduleService scheduleService;

    @InjectMocks
    private ScheduleController scheduleController;

    @Test
    @DisplayName("GET /schedule/today - should return today's competitions")
    void getTodayCompetitions_success() {
        // given
        TodayCompetitionItem item = TodayCompetitionItem.builder()
                .competitionId(1L)
                .name("K리그 2026")
                .status("IN_PROGRESS")
                .startDate(LocalDate.of(2026, 3, 1))
                .build();
        given(scheduleService.getTodayCompetitions(null, null)).willReturn(List.of(item));

        // when
        ApiResponse<List<TodayCompetitionItem>> result =
                scheduleController.getTodayCompetitions(null, null);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getCompetitionId()).isEqualTo(1L);
        verify(scheduleService).getTodayCompetitions(null, null);
    }

    @Test
    @DisplayName("GET /schedule/today - should filter by sportId")
    void getTodayCompetitions_withSportId() {
        // given
        given(scheduleService.getTodayCompetitions(1L, null)).willReturn(List.of());

        // when
        ApiResponse<List<TodayCompetitionItem>> result =
                scheduleController.getTodayCompetitions(1L, null);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isEmpty();
        verify(scheduleService).getTodayCompetitions(1L, null);
    }

    @Test
    @DisplayName("GET /schedule/today - should filter by month")
    void getTodayCompetitions_withMonth() {
        // given
        TodayCompetitionItem item = TodayCompetitionItem.builder()
                .competitionId(2L)
                .name("Cup Match")
                .build();
        given(scheduleService.getTodayCompetitions(null, 4)).willReturn(List.of(item));

        // when
        ApiResponse<List<TodayCompetitionItem>> result =
                scheduleController.getTodayCompetitions(null, 4);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).hasSize(1);
    }
}
