package com.pochak.content.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private List<TodayCompetitionItem> todayCompetitions;
    private LinkedHashMap<LocalDate, List<MatchScheduleItem>> matchesByDate;
}
