package com.pochak.admin.analytics.service;

import com.pochak.admin.analytics.dto.BulkEventRequest;
import com.pochak.admin.analytics.entity.AnalyticsEvent;
import com.pochak.admin.analytics.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsIngestionService {

    private final AnalyticsEventRepository analyticsEventRepository;

    @Transactional
    public int ingestEvents(BulkEventRequest request) {
        if (request.getEvents() == null || request.getEvents().isEmpty()) {
            return 0;
        }

        List<AnalyticsEvent> entities = request.getEvents().stream()
                .map(item -> AnalyticsEvent.builder()
                        .eventName(item.getName())
                        .userId(item.getUserId())
                        .sessionId(item.getSessionId())
                        .properties(item.getProperties())
                        .eventTime(parseTimestamp(item.getTimestamp()))
                        .build())
                .toList();

        analyticsEventRepository.saveAll(entities);
        log.debug("Ingested {} analytics events", entities.size());
        return entities.size();
    }

    private LocalDateTime parseTimestamp(String timestamp) {
        if (timestamp == null || timestamp.isBlank()) {
            return LocalDateTime.now();
        }
        try {
            Instant instant = Instant.parse(timestamp);
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (Exception e) {
            log.warn("Failed to parse timestamp '{}', using now()", timestamp);
            return LocalDateTime.now();
        }
    }
}
