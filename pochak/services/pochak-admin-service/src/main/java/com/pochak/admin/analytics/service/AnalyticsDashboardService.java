package com.pochak.admin.analytics.service;

import com.pochak.admin.analytics.dto.DashboardStatsResponse;
import com.pochak.admin.analytics.dto.DashboardStatsResponse.DailyActiveItem;
import com.pochak.admin.analytics.dto.DashboardStatsResponse.TopContentItem;
import com.pochak.admin.analytics.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsDashboardService {

    private static final Set<String> VALID_PERIODS = Set.of("day", "week", "month");

    private final AnalyticsEventRepository analyticsEventRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String period) {
        if (period == null || period.isBlank()) {
            period = "month";
        }
        if (!VALID_PERIODS.contains(period)) {
            throw new IllegalArgumentException("Invalid period: " + period + ". Must be one of: day, week, month");
        }

        long totalEvents = analyticsEventRepository.count();

        if (totalEvents == 0) {
            return buildMockResponse(period);
        }

        LocalDateTime since = computeSince(period);

        long visitors = analyticsEventRepository.countDistinctSessionsSince(since);
        long activeUsers = analyticsEventRepository.countDistinctUsersSince(since);
        long views = analyticsEventRepository.countByEventNameAndEventTimeAfter("content_play", since);
        long purchaseCount = analyticsEventRepository.countByEventNameAndEventTimeAfter("purchase", since);
        long revenue = analyticsEventRepository.sumRevenueByEventTimeSince(since);

        List<Object[]> topContentRaw = analyticsEventRepository.topContentByViews(since, 10);
        List<TopContentItem> topContent = topContentRaw.stream()
                .map(row -> TopContentItem.builder()
                        .contentId((String) row[0])
                        .viewCount(((Number) row[1]).longValue())
                        .build())
                .toList();

        List<Object[]> dailyRaw = analyticsEventRepository.dailyActiveSessionsSince(since);
        List<DailyActiveItem> trend = dailyRaw.stream()
                .map(row -> DailyActiveItem.builder()
                        .date(row[0].toString())
                        .activeUsers(((Number) row[1]).longValue())
                        .build())
                .toList();

        return DashboardStatsResponse.builder()
                .period(period)
                .visitors(visitors)
                .activeUsers(activeUsers)
                .views(views)
                .purchaseCount(purchaseCount)
                .revenue(revenue)
                .totalContents(views)
                .topContent(topContent)
                .activeUsersTrend(trend)
                .build();
    }

    private LocalDateTime computeSince(String period) {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        return switch (period) {
            case "day" -> todayStart;
            case "week" -> todayStart.minusDays(7);
            case "month" -> todayStart.minusDays(30);
            default -> todayStart.minusDays(30);
        };
    }

    private DashboardStatsResponse buildMockResponse(String period) {
        List<TopContentItem> mockTopContent = List.of(
                TopContentItem.builder().contentId("live-001").viewCount(1247).build(),
                TopContentItem.builder().contentId("vod-003").viewCount(892).build(),
                TopContentItem.builder().contentId("clip-015").viewCount(654).build(),
                TopContentItem.builder().contentId("vod-007").viewCount(421).build(),
                TopContentItem.builder().contentId("live-002").viewCount(318).build()
        );

        List<DailyActiveItem> mockTrend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        int days = switch (period) {
            case "day" -> 1;
            case "week" -> 7;
            default -> 30;
        };
        for (int i = days - 1; i >= 0; i--) {
            mockTrend.add(DailyActiveItem.builder()
                    .date(today.minusDays(i).toString())
                    .activeUsers((long) (50 + Math.random() * 150))
                    .build());
        }

        long mockVisitors = switch (period) {
            case "day" -> 142;
            case "week" -> 873;
            default -> 3241;
        };
        long mockActiveUsers = switch (period) {
            case "day" -> 89;
            case "week" -> 512;
            default -> 1876;
        };
        long mockViews = switch (period) {
            case "day" -> 324;
            case "week" -> 2156;
            default -> 8743;
        };

        return DashboardStatsResponse.builder()
                .period(period)
                .visitors(mockVisitors)
                .activeUsers(mockActiveUsers)
                .views(mockViews)
                .purchaseCount(0)
                .revenue(0)
                .totalContents(456)
                .topContent(mockTopContent)
                .activeUsersTrend(mockTrend)
                .build();
    }
}
