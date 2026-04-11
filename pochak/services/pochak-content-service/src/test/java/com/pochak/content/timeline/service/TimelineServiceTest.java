package com.pochak.content.timeline.service;

import com.pochak.content.timeline.dto.CreateTimelineEventRequest;
import com.pochak.content.timeline.dto.TimelineEventResponse;
import com.pochak.content.timeline.entity.MatchTimelineEvent;
import com.pochak.content.timeline.repository.MatchTimelineEventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class TimelineServiceTest {

    @Mock
    private MatchTimelineEventRepository timelineEventRepository;

    @InjectMocks
    private TimelineService timelineService;

    @Test
    @DisplayName("Should return timeline events sorted by timestamp")
    void testGetTimelineEvents() {
        // given
        MatchTimelineEvent event1 = MatchTimelineEvent.builder()
                .id(1L).contentType("LIVE").contentId(10L)
                .eventType(MatchTimelineEvent.EventType.GOAL)
                .timestampSeconds(120).description("First goal").teamId(1L)
                .build();
        MatchTimelineEvent event2 = MatchTimelineEvent.builder()
                .id(2L).contentType("LIVE").contentId(10L)
                .eventType(MatchTimelineEvent.EventType.CARD)
                .timestampSeconds(300).description("Yellow card").teamId(2L)
                .build();

        given(timelineEventRepository
                .findByContentTypeAndContentIdOrderByTimestampSecondsAsc("LIVE", 10L))
                .willReturn(List.of(event1, event2));

        // when
        List<TimelineEventResponse> result = timelineService.getTimelineEvents("LIVE", 10L);

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getEventType()).isEqualTo(MatchTimelineEvent.EventType.GOAL);
        assertThat(result.get(0).getTimestampSeconds()).isEqualTo(120);
        assertThat(result.get(1).getEventType()).isEqualTo(MatchTimelineEvent.EventType.CARD);
    }

    @Test
    @DisplayName("Should return empty list when no events exist")
    void testGetTimelineEventsEmpty() {
        // given
        given(timelineEventRepository
                .findByContentTypeAndContentIdOrderByTimestampSecondsAsc("VOD", 99L))
                .willReturn(List.of());

        // when
        List<TimelineEventResponse> result = timelineService.getTimelineEvents("VOD", 99L);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should create a timeline event and return response")
    void testCreateTimelineEvent() {
        // given
        CreateTimelineEventRequest request = CreateTimelineEventRequest.builder()
                .eventType(MatchTimelineEvent.EventType.GOAL)
                .timestampSeconds(540)
                .description("Equalizer")
                .teamId(2L)
                .build();

        MatchTimelineEvent saved = MatchTimelineEvent.builder()
                .id(1L).contentType("LIVE").contentId(10L)
                .eventType(MatchTimelineEvent.EventType.GOAL)
                .timestampSeconds(540).description("Equalizer").teamId(2L)
                .build();

        given(timelineEventRepository.save(any(MatchTimelineEvent.class))).willReturn(saved);

        // when
        TimelineEventResponse response = timelineService.createTimelineEvent("LIVE", 10L, request);

        // then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getContentType()).isEqualTo("LIVE");
        assertThat(response.getContentId()).isEqualTo(10L);
        assertThat(response.getEventType()).isEqualTo(MatchTimelineEvent.EventType.GOAL);
        assertThat(response.getTimestampSeconds()).isEqualTo(540);
        assertThat(response.getDescription()).isEqualTo("Equalizer");
        assertThat(response.getTeamId()).isEqualTo(2L);
    }
}
