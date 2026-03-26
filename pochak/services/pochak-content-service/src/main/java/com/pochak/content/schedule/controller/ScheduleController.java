package com.pochak.content.schedule.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.schedule.dto.MatchScheduleItem;
import com.pochak.content.schedule.dto.ScheduleResponse;
import com.pochak.content.schedule.dto.TodayCompetitionItem;
import com.pochak.content.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;

@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/today")
    public ApiResponse<List<TodayCompetitionItem>> getTodayCompetitions(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) Integer month) {
        List<TodayCompetitionItem> result = scheduleService.getTodayCompetitions(sportId, month);
        return ApiResponse.success(result);
    }

    @GetMapping("/matches")
    public ApiResponse<ScheduleResponse> getMatches(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) Long competitionId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<TodayCompetitionItem> todayCompetitions = scheduleService.getTodayCompetitions(sportId, month);
        LinkedHashMap<LocalDate, List<MatchScheduleItem>> matchesByDate =
                scheduleService.getMatchesByDate(sportId, competitionId, month, date);

        ScheduleResponse response = ScheduleResponse.builder()
                .todayCompetitions(todayCompetitions)
                .matchesByDate(matchesByDate)
                .build();

        return ApiResponse.success(response);
    }
}
