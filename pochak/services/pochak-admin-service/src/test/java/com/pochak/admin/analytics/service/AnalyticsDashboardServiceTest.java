package com.pochak.admin.analytics.service;

import com.pochak.admin.analytics.dto.DashboardStatsResponse;
import com.pochak.admin.analytics.repository.AnalyticsEventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsDashboardServiceTest {

    @InjectMocks
    private AnalyticsDashboardService dashboardService;

    @Mock
    private AnalyticsEventRepository analyticsEventRepository;

    @Test
    @DisplayName("Should return stats filtered by 'day' period")
    void testGetDashboardStatsByDay() {
        when(analyticsEventRepository.count()).thenReturn(10L);
        when(analyticsEventRepository.countDistinctSessionsSince(any(LocalDateTime.class))).thenReturn(50L);
        when(analyticsEventRepository.countDistinctUsersSince(any(LocalDateTime.class))).thenReturn(30L);
        when(analyticsEventRepository.countByEventNameAndEventTimeAfter(eq("content_play"), any())).thenReturn(100L);
        when(analyticsEventRepository.countByEventNameAndEventTimeAfter(eq("purchase"), any())).thenReturn(5L);
        when(analyticsEventRepository.sumRevenueByEventTimeSince(any())).thenReturn(150000L);
        when(analyticsEventRepository.topContentByViews(any(), anyInt())).thenReturn(Collections.emptyList());
        when(analyticsEventRepository.dailyActiveSessionsSince(any())).thenReturn(Collections.emptyList());

        DashboardStatsResponse response = dashboardService.getDashboardStats("day");

        assertNotNull(response);
        assertEquals("day", response.getPeriod());
        assertEquals(50, response.getVisitors());
        assertEquals(30, response.getActiveUsers());
        assertEquals(100, response.getViews());
        assertEquals(150000, response.getRevenue());
    }

    @Test
    @DisplayName("Should return stats filtered by 'week' period")
    void testGetDashboardStatsByWeek() {
        when(analyticsEventRepository.count()).thenReturn(10L);
        when(analyticsEventRepository.countDistinctSessionsSince(any(LocalDateTime.class))).thenReturn(200L);
        when(analyticsEventRepository.countDistinctUsersSince(any(LocalDateTime.class))).thenReturn(120L);
        when(analyticsEventRepository.countByEventNameAndEventTimeAfter(eq("content_play"), any())).thenReturn(500L);
        when(analyticsEventRepository.countByEventNameAndEventTimeAfter(eq("purchase"), any())).thenReturn(20L);
        when(analyticsEventRepository.sumRevenueByEventTimeSince(any())).thenReturn(750000L);
        when(analyticsEventRepository.topContentByViews(any(), anyInt())).thenReturn(Collections.emptyList());
        when(analyticsEventRepository.dailyActiveSessionsSince(any())).thenReturn(Collections.emptyList());

        DashboardStatsResponse response = dashboardService.getDashboardStats("week");

        assertNotNull(response);
        assertEquals("week", response.getPeriod());
        assertEquals(200, response.getVisitors());
        assertEquals(120, response.getActiveUsers());
    }

    @Test
    @DisplayName("Should return stats filtered by 'month' period")
    void testGetDashboardStatsByMonth() {
        when(analyticsEventRepository.count()).thenReturn(10L);
        when(analyticsEventRepository.countDistinctSessionsSince(any(LocalDateTime.class))).thenReturn(1000L);
        when(analyticsEventRepository.countDistinctUsersSince(any(LocalDateTime.class))).thenReturn(500L);
        when(analyticsEventRepository.countByEventNameAndEventTimeAfter(eq("content_play"), any())).thenReturn(3000L);
        when(analyticsEventRepository.countByEventNameAndEventTimeAfter(eq("purchase"), any())).thenReturn(100L);
        when(analyticsEventRepository.sumRevenueByEventTimeSince(any())).thenReturn(5000000L);
        List<Object[]> topContentData = new ArrayList<>();
        topContentData.add(new Object[]{"vod-001", 500L});
        when(analyticsEventRepository.topContentByViews(any(), anyInt())).thenReturn(topContentData);
        when(analyticsEventRepository.dailyActiveSessionsSince(any())).thenReturn(Collections.emptyList());

        DashboardStatsResponse response = dashboardService.getDashboardStats("month");

        assertNotNull(response);
        assertEquals("month", response.getPeriod());
        assertEquals(1000, response.getVisitors());
        assertEquals(500, response.getActiveUsers());
        assertEquals(3000, response.getViews());
        assertEquals(1, response.getTopContent().size());
        assertEquals("vod-001", response.getTopContent().get(0).getContentId());
    }

    @Test
    @DisplayName("Should default to 'month' for null period")
    void testGetDashboardStatsDefaultPeriod() {
        when(analyticsEventRepository.count()).thenReturn(10L);
        when(analyticsEventRepository.countDistinctSessionsSince(any(LocalDateTime.class))).thenReturn(1000L);
        when(analyticsEventRepository.countDistinctUsersSince(any(LocalDateTime.class))).thenReturn(500L);
        when(analyticsEventRepository.countByEventNameAndEventTimeAfter(anyString(), any())).thenReturn(100L);
        when(analyticsEventRepository.sumRevenueByEventTimeSince(any())).thenReturn(500000L);
        when(analyticsEventRepository.topContentByViews(any(), anyInt())).thenReturn(Collections.emptyList());
        when(analyticsEventRepository.dailyActiveSessionsSince(any())).thenReturn(Collections.emptyList());

        DashboardStatsResponse response = dashboardService.getDashboardStats(null);

        assertEquals("month", response.getPeriod());
    }

    @Test
    @DisplayName("Should return mock data when no events exist")
    void testGetDashboardStatsMockWhenEmpty() {
        when(analyticsEventRepository.count()).thenReturn(0L);

        DashboardStatsResponse response = dashboardService.getDashboardStats("day");

        assertNotNull(response);
        assertEquals("day", response.getPeriod());
        assertTrue(response.getVisitors() > 0);
        assertFalse(response.getTopContent().isEmpty());
    }

    @Test
    @DisplayName("Should throw for invalid period value")
    void testGetDashboardStatsInvalidPeriod() {
        assertThrows(IllegalArgumentException.class, () ->
                dashboardService.getDashboardStats("year")
        );
    }
}
