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

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsDashboardService {

    private final AnalyticsEventRepository analyticsEventRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime weekStart = todayStart.minusDays(7);
        LocalDateTime monthStart = todayStart.minusDays(30);

        long totalEvents = analyticsEventRepository.count();

        // If no events exist, return mock data for initial dashboard display
        if (totalEvents == 0) {
            return buildMockResponse();
        }

        // Visitor counts (distinct sessions)
        long todayVisitors = analyticsEventRepository.countDistinctSessionsSince(todayStart);
        long weekVisitors = analyticsEventRepository.countDistinctSessionsSince(weekStart);
        long monthVisitors = analyticsEventRepository.countDistinctSessionsSince(monthStart);

        // Active users (distinct userIds)
        long todayActiveUsers = analyticsEventRepository.countDistinctUsersSince(todayStart);
        long weekActiveUsers = analyticsEventRepository.countDistinctUsersSince(weekStart);
        long monthActiveUsers = analyticsEventRepository.countDistinctUsersSince(monthStart);

        // Views (content_play events)
        long todayViews = analyticsEventRepository.countByEventNameAndEventTimeAfter("content_play", todayStart);
        long weekViews = analyticsEventRepository.countByEventNameAndEventTimeAfter("content_play", weekStart);
        long monthViews = analyticsEventRepository.countByEventNameAndEventTimeAfter("content_play", monthStart);

        // Revenue (purchase events count as proxy; real revenue would sum amounts from properties)
        long todayRevenue = analyticsEventRepository.countByEventNameAndEventTimeAfter("purchase", todayStart);
        long weekRevenue = analyticsEventRepository.countByEventNameAndEventTimeAfter("purchase", weekStart);
        long monthRevenue = analyticsEventRepository.countByEventNameAndEventTimeAfter("purchase", monthStart);

        // Top content
        List<Object[]> topContentRaw = analyticsEventRepository.topContentByViews(monthStart, 10);
        List<TopContentItem> topContent = topContentRaw.stream()
                .map(row -> TopContentItem.builder()
                        .contentId((String) row[0])
                        .viewCount(((Number) row[1]).longValue())
                        .build())
                .toList();

        // Daily active users trend (last 30 days)
        List<Object[]> dailyRaw = analyticsEventRepository.dailyActiveSessionsSince(monthStart);
        List<DailyActiveItem> trend = dailyRaw.stream()
                .map(row -> DailyActiveItem.builder()
                        .date(row[0].toString())
                        .activeUsers(((Number) row[1]).longValue())
                        .build())
                .toList();

        return DashboardStatsResponse.builder()
                .todayVisitors(todayVisitors)
                .weekVisitors(weekVisitors)
                .monthVisitors(monthVisitors)
                .todayActiveUsers(todayActiveUsers)
                .weekActiveUsers(weekActiveUsers)
                .monthActiveUsers(monthActiveUsers)
                .todayViews(todayViews)
                .weekViews(weekViews)
                .monthViews(monthViews)
                .todayRevenue(todayRevenue)
                .weekRevenue(weekRevenue)
                .monthRevenue(monthRevenue)
                .totalContents(todayViews + weekViews) // placeholder
                .topContent(topContent)
                .activeUsersTrend(trend)
                .build();
    }

    /**
     * Returns mock data when no analytics events exist yet.
     * This ensures the BO dashboard shows meaningful placeholder values.
     */
    private DashboardStatsResponse buildMockResponse() {
        List<TopContentItem> mockTopContent = List.of(
                TopContentItem.builder().contentId("live-001").viewCount(1247).build(),
                TopContentItem.builder().contentId("vod-003").viewCount(892).build(),
                TopContentItem.builder().contentId("clip-015").viewCount(654).build(),
                TopContentItem.builder().contentId("vod-007").viewCount(421).build(),
                TopContentItem.builder().contentId("live-002").viewCount(318).build()
        );

        List<DailyActiveItem> mockTrend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            mockTrend.add(DailyActiveItem.builder()
                    .date(today.minusDays(i).toString())
                    .activeUsers((long) (50 + Math.random() * 150))
                    .build());
        }

        return DashboardStatsResponse.builder()
                .todayVisitors(142)
                .weekVisitors(873)
                .monthVisitors(3241)
                .todayActiveUsers(89)
                .weekActiveUsers(512)
                .monthActiveUsers(1876)
                .todayViews(324)
                .weekViews(2156)
                .monthViews(8743)
                .todayRevenue(5)
                .weekRevenue(32)
                .monthRevenue(127)
                .totalContents(456)
                .topContent(mockTopContent)
                .activeUsersTrend(mockTrend)
                .build();
    }
}
