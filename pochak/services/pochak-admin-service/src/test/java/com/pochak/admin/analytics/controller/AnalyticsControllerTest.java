package com.pochak.admin.analytics.controller;

import com.pochak.admin.analytics.dto.DashboardStatsResponse;
import com.pochak.admin.analytics.service.AnalyticsDashboardService;
import com.pochak.admin.analytics.service.AnalyticsIngestionService;
import com.pochak.admin.common.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    @InjectMocks
    private AnalyticsController analyticsController;

    @Mock
    private AnalyticsIngestionService ingestionService;

    @Mock
    private AnalyticsDashboardService dashboardService;

    @Nested
    @DisplayName("GET /admin/api/v1/analytics/dashboard")
    class GetDashboardStats {

        @Test
        @DisplayName("Should return dashboard stats with default period")
        void getDashboardStats_defaultPeriod() {
            // given
            DashboardStatsResponse stats = DashboardStatsResponse.builder()
                    .period("month")
                    .visitors(3241)
                    .activeUsers(1876)
                    .views(8743)
                    .revenue(0)
                    .purchaseCount(0)
                    .totalContents(456)
                    .topContent(List.of(
                            DashboardStatsResponse.TopContentItem.builder()
                                    .contentId("live-001")
                                    .viewCount(1247)
                                    .build()
                    ))
                    .activeUsersTrend(Collections.emptyList())
                    .build();

            given(dashboardService.getDashboardStats("month")).willReturn(stats);

            // when
            ApiResponse<DashboardStatsResponse> response = analyticsController.getDashboardStats("month");

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData().getPeriod()).isEqualTo("month");
            assertThat(response.getData().getVisitors()).isEqualTo(3241);
            assertThat(response.getData().getActiveUsers()).isEqualTo(1876);
            assertThat(response.getData().getViews()).isEqualTo(8743);
            assertThat(response.getData().getTopContent()).hasSize(1);
            verify(dashboardService).getDashboardStats("month");
        }

        @Test
        @DisplayName("Should return dashboard stats for day period")
        void getDashboardStats_dayPeriod() {
            // given
            DashboardStatsResponse stats = DashboardStatsResponse.builder()
                    .period("day")
                    .visitors(142)
                    .activeUsers(89)
                    .views(324)
                    .revenue(0)
                    .purchaseCount(0)
                    .totalContents(50)
                    .topContent(Collections.emptyList())
                    .activeUsersTrend(Collections.emptyList())
                    .build();

            given(dashboardService.getDashboardStats("day")).willReturn(stats);

            // when
            ApiResponse<DashboardStatsResponse> response = analyticsController.getDashboardStats("day");

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData().getPeriod()).isEqualTo("day");
            assertThat(response.getData().getVisitors()).isEqualTo(142);
        }

        @Test
        @DisplayName("Should propagate exception for invalid period")
        void getDashboardStats_invalidPeriod() {
            // given
            given(dashboardService.getDashboardStats("invalid"))
                    .willThrow(new IllegalArgumentException("Invalid period: invalid"));

            // when & then
            assertThatThrownBy(() -> analyticsController.getDashboardStats("invalid"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid period");
        }
    }
}
