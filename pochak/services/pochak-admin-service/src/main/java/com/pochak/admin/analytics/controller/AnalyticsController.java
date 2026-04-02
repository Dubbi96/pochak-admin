package com.pochak.admin.analytics.controller;

import com.pochak.admin.analytics.dto.BulkEventRequest;
import com.pochak.admin.analytics.dto.DashboardStatsResponse;
import com.pochak.admin.analytics.service.AnalyticsDashboardService;
import com.pochak.admin.analytics.service.AnalyticsIngestionService;
import com.pochak.admin.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsIngestionService ingestionService;
    private final AnalyticsDashboardService dashboardService;

    /**
     * Bulk event ingestion endpoint.
     * Accepts an array of analytics events from mobile/web clients.
     */
    @PostMapping("/events")
    public ApiResponse<Map<String, Integer>> ingestEvents(@RequestBody BulkEventRequest request) {
        int count = ingestionService.ingestEvents(request);
        return ApiResponse.ok(Map.of("ingested", count));
    }

    /**
     * Dashboard aggregated stats for BO.
     * Returns KPIs: visitors, views, revenue, top content, active users trend.
     */
    @GetMapping("/dashboard")
    public ApiResponse<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ApiResponse.ok(stats);
    }
}
