package com.pochak.content.timeline.repository;

import com.pochak.content.timeline.entity.MatchTimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchTimelineEventRepository extends JpaRepository<MatchTimelineEvent, Long> {

    List<MatchTimelineEvent> findByContentTypeAndContentIdOrderByTimestampSecondsAsc(
            String contentType, Long contentId);

    List<MatchTimelineEvent> findByContentTypeAndContentIdAndEventTypeOrderByTimestampSecondsAsc(
            String contentType, Long contentId, MatchTimelineEvent.EventType eventType);
}
