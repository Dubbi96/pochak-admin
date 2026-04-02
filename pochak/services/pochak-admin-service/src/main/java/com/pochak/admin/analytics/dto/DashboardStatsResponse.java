package com.pochak.admin.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardStatsResponse {

    // Selected period: day, week, month
    private String period;

    // Period-specific aggregations
    private long visitors;
    private long activeUsers;
    private long views;
    private long revenue;
    private long purchaseCount;

    // Total content count (distinct contentIds in content_play events for this period)
    private long totalContents;

    // Top content by views within the period
    private List<TopContentItem> topContent;

    // Daily active users trend within the period
    private List<DailyActiveItem> activeUsersTrend;

    @Getter
    @Builder
    public static class TopContentItem {
        private String contentId;
        private long viewCount;
    }

    @Getter
    @Builder
    public static class DailyActiveItem {
        private String date;
        private long activeUsers;
    }
}
