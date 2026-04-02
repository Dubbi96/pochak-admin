package com.pochak.admin.analytics.repository;

import com.pochak.admin.analytics.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    long countByEventNameAndEventTimeAfter(String eventName, LocalDateTime after);

    @Query("SELECT COUNT(DISTINCT e.userId) FROM AnalyticsEvent e WHERE e.eventTime >= :after AND e.userId IS NOT NULL")
    long countDistinctUsersSince(@Param("after") LocalDateTime after);

    @Query("SELECT COUNT(DISTINCT e.sessionId) FROM AnalyticsEvent e WHERE e.eventTime >= :after")
    long countDistinctSessionsSince(@Param("after") LocalDateTime after);

    @Query(value = """
        SELECT CAST(e.event_time AS DATE) AS day, COUNT(DISTINCT e.session_id) AS cnt
        FROM admin.analytics_events e
        WHERE e.event_time >= :since
        GROUP BY CAST(e.event_time AS DATE)
        ORDER BY day
        """, nativeQuery = true)
    List<Object[]> dailyActiveSessionsSince(@Param("since") LocalDateTime since);

    @Query(value = """
        SELECT COALESCE(SUM(CAST(e.properties->>'amount' AS BIGINT)), 0)
        FROM admin.analytics_events e
        WHERE e.event_name = 'purchase' AND e.event_time >= :since
        """, nativeQuery = true)
    long sumRevenueByEventTimeSince(@Param("since") LocalDateTime since);

    @Query(value = """
        SELECT e.properties->>'contentId' AS content_id, COUNT(*) AS view_count
        FROM admin.analytics_events e
        WHERE e.event_name = 'content_play' AND e.event_time >= :since
        GROUP BY e.properties->>'contentId'
        ORDER BY view_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> topContentByViews(@Param("since") LocalDateTime since, @Param("limit") int limit);
}
