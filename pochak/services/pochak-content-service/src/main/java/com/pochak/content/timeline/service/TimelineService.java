package com.pochak.content.timeline.service;

import com.pochak.content.timeline.dto.CreateTimelineEventRequest;
import com.pochak.content.timeline.dto.TimelineEventResponse;
import com.pochak.content.timeline.entity.MatchTimelineEvent;
import com.pochak.content.timeline.repository.MatchTimelineEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimelineService {

    private final MatchTimelineEventRepository timelineEventRepository;

    public List<TimelineEventResponse> getTimelineEvents(String contentType, Long contentId) {
        return timelineEventRepository
                .findByContentTypeAndContentIdOrderByTimestampSecondsAsc(contentType, contentId)
                .stream()
                .map(TimelineEventResponse::from)
                .toList();
    }

    @Transactional
    public TimelineEventResponse createTimelineEvent(
            String contentType, Long contentId, CreateTimelineEventRequest request) {

        MatchTimelineEvent entity = MatchTimelineEvent.builder()
                .contentType(contentType)
                .contentId(contentId)
                .eventType(request.getEventType())
                .timestampSeconds(request.getTimestampSeconds())
                .description(request.getDescription())
                .teamId(request.getTeamId())
                .build();

        MatchTimelineEvent saved = timelineEventRepository.save(entity);
        return TimelineEventResponse.from(saved);
    }
}
