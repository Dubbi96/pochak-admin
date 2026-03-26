package com.pochak.content.schedule.service;

import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.competition.repository.MatchRepository;
import com.pochak.content.schedule.dto.MatchScheduleItem;
import com.pochak.content.schedule.dto.ScheduleResponse;
import com.pochak.content.schedule.dto.TodayCompetitionItem;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final CompetitionRepository competitionRepository;
    private final MatchRepository matchRepository;
    private final LiveAssetRepository liveAssetRepository;
    private final VodAssetRepository vodAssetRepository;

    @Cacheable(value = "schedule", key = "#sportId + '-' + #month", unless = "#result == null || #result.isEmpty()")
    public List<TodayCompetitionItem> getTodayCompetitions(Long sportId, Integer month) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        if (month != null) {
            YearMonth yearMonth = YearMonth.of(today.getYear(), month);
            startDate = yearMonth.atDay(1);
            endDate = yearMonth.atEndOfMonth();
        } else {
            startDate = today;
            endDate = today;
        }

        List<Competition> competitions = competitionRepository.findActiveCompetitions(
                sportId, startDate, endDate);

        return competitions.stream()
                .map(TodayCompetitionItem::from)
                .toList();
    }

    public LinkedHashMap<LocalDate, List<MatchScheduleItem>> getMatchesByDate(
            Long sportId, Long competitionId, Integer month, LocalDate date) {

        LocalDateTime dateFrom;
        LocalDateTime dateTo;

        if (date != null) {
            dateFrom = date.atStartOfDay();
            dateTo = date.plusDays(1).atStartOfDay();
        } else if (month != null) {
            LocalDate today = LocalDate.now();
            YearMonth yearMonth = YearMonth.of(today.getYear(), month);
            dateFrom = yearMonth.atDay(1).atStartOfDay();
            dateTo = yearMonth.atEndOfMonth().plusDays(1).atStartOfDay();
        } else {
            // Default: current month
            LocalDate today = LocalDate.now();
            YearMonth yearMonth = YearMonth.from(today);
            dateFrom = yearMonth.atDay(1).atStartOfDay();
            dateTo = yearMonth.atEndOfMonth().plusDays(1).atStartOfDay();
        }

        // Single query with fetch joins for matches
        List<Match> matches = matchRepository.findScheduleMatches(
                sportId, competitionId, dateFrom, dateTo);

        if (matches.isEmpty()) {
            return new LinkedHashMap<>();
        }

        // Batch fetch live and vod assets for all match IDs to avoid N+1
        Set<Long> matchIds = matches.stream()
                .map(Match::getId)
                .collect(Collectors.toSet());

        Set<Long> matchIdsWithLive = liveAssetRepository.findByMatchIdIn(matchIds).stream()
                .filter(la -> la.getStatus() == LiveAsset.LiveStatus.BROADCASTING
                        || la.getStatus() == LiveAsset.LiveStatus.SCHEDULED)
                .map(la -> la.getMatch().getId())
                .collect(Collectors.toSet());

        Set<Long> matchIdsWithVod = vodAssetRepository.findByMatchIdIn(matchIds).stream()
                .map(va -> va.getMatch().getId())
                .collect(Collectors.toSet());

        // Group by date, preserving insertion order
        LinkedHashMap<LocalDate, List<MatchScheduleItem>> result = new LinkedHashMap<>();

        for (Match match : matches) {
            LocalDate matchDate = match.getStartTime().toLocalDate();
            boolean hasLive = matchIdsWithLive.contains(match.getId());
            boolean hasVod = matchIdsWithVod.contains(match.getId());

            MatchScheduleItem item = MatchScheduleItem.from(match, hasLive, hasVod);

            result.computeIfAbsent(matchDate, k -> new ArrayList<>()).add(item);
        }

        return result;
    }
}
