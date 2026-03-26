package com.pochak.admin.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardStatsResponse {

    // Visitor counts
    private long todayVisitors;
    private long weekVisitors;
    private long monthVisitors;

    // Active unique users
    private long todayActiveUsers;
    private long weekActiveUsers;
    private long monthActiveUsers;

    // Content views
    private long todayViews;
    private long weekViews;
    private long monthViews;

    // Revenue (purchase events)
    private long todayRevenue;
    private long weekRevenue;
    private long monthRevenue;

    // Total content count (from content_play distinct contentIds)
    private long totalContents;

    // Top content by views
    private List<TopContentItem> topContent;

    // Daily active users trend (last 30 days)
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
