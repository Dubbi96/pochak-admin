package com.pochak.content.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listens for content-related domain events and triggers cross-service actions.
 * In Phase 0-2 this runs in-process via Spring events.
 * In Phase 3 these will become RabbitMQ consumers.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ContentEventListener {

    @Async
    @EventListener
    public void onContentPublished(ContentPublishedEvent event) {
        log.info("[ContentEventListener] Content published: contentId={} type={} title='{}' sport={}",
                event.getContentId(), event.getContentType(), event.getTitle(), event.getSportCode());

        // TODO: Phase 3 - send push notification to users subscribed to this sport
        // notificationClient.sendToSportSubscribers(event.getSportCode(), buildNotification(event));
    }

    @Async
    @EventListener
    public void onLiveStreamStarted(LiveStreamStartedEvent event) {
        log.info("[ContentEventListener] Live stream started: matchId={} venueId={} startTime={}",
                event.getMatchId(), event.getVenueId(), event.getStartTime());

        // TODO: Phase 3 - create MATCH notification for subscribed users
        // notificationClient.sendMatchNotification(event.getMatchId(), NotificationType.LIVE_STARTED);
    }

    @Async
    @EventListener
    public void onLiveStreamEnded(LiveStreamEndedEvent event) {
        log.info("[ContentEventListener] Live stream ended: matchId={} duration={}",
                event.getMatchId(), event.getDuration());

        // TODO: Phase 3 - trigger VOD encoding pipeline
        // encodingClient.requestVodEncoding(event.getMatchId());
    }

    @Async
    @EventListener
    public void onClipCreated(ClipCreatedEvent event) {
        log.info("[ContentEventListener] Clip created: clipId={} sourceContentId={} creatorUserId={}",
                event.getClipId(), event.getSourceContentId(), event.getCreatorUserId());

        // TODO: Phase 3 - notify content owner, update clip count
        // notificationClient.notifyClipCreated(event.getSourceContentId(), event.getCreatorUserId());
    }
}
