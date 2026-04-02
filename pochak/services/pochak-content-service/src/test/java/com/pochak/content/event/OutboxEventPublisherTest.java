package com.pochak.content.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pochak.common.event.outbox.OutboxEvent;
import com.pochak.common.event.outbox.OutboxEventPublisher;
import com.pochak.common.event.outbox.OutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * M7: OutboxEventPublisher 실제 사용 테스트.
 * 이벤트 발행 시 outbox_events 테이블에 저장되는지 확인.
 */
@ExtendWith(MockitoExtension.class)
class OutboxEventPublisherTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;

    private OutboxEventPublisher outboxEventPublisher;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        outboxEventPublisher = new OutboxEventPublisher(outboxEventRepository, objectMapper);
    }

    @Test
    @DisplayName("ContentPublishedEvent 발행 시 OutboxEvent가 저장됨")
    void contentPublished_savedToOutbox() {
        // given
        ContentPublishedEvent event = new ContentPublishedEvent(1L, "LIVE", "Team A vs B", "SOCCER");

        given(outboxEventRepository.save(any(OutboxEvent.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        outboxEventPublisher.publish(event);

        // then
        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(captor.capture());

        OutboxEvent saved = captor.getValue();
        assertThat(saved.getEventType()).isEqualTo("ContentPublishedEvent");
        assertThat(saved.getAggregateId()).isEqualTo("1");
        assertThat(saved.getPayload()).contains("\"contentId\":1");
        assertThat(saved.getPayload()).contains("\"contentType\":\"LIVE\"");
        assertThat(saved.getPublishedAt()).isNull(); // not yet published to broker
    }

    @Test
    @DisplayName("LiveStreamStartedEvent 발행 시 OutboxEvent가 저장됨")
    void liveStreamStarted_savedToOutbox() {
        // given
        LiveStreamStartedEvent event = new LiveStreamStartedEvent(
                100L, 50L, java.time.LocalDateTime.of(2026, 3, 20, 15, 0));

        given(outboxEventRepository.save(any(OutboxEvent.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        outboxEventPublisher.publish(event);

        // then
        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(captor.capture());

        OutboxEvent saved = captor.getValue();
        assertThat(saved.getEventType()).isEqualTo("LiveStreamStartedEvent");
        assertThat(saved.getPayload()).contains("\"matchId\":100");
    }

    @Test
    @DisplayName("ClipCreatedEvent 발행 시 OutboxEvent가 저장됨")
    void clipCreated_savedToOutbox() {
        // given
        ClipCreatedEvent event = new ClipCreatedEvent(10L, 1L, 100L);

        given(outboxEventRepository.save(any(OutboxEvent.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        outboxEventPublisher.publish(event);

        // then
        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(captor.capture());

        OutboxEvent saved = captor.getValue();
        assertThat(saved.getEventType()).isEqualTo("ClipCreatedEvent");
        assertThat(saved.getAggregateId()).isEqualTo("10");
    }
}
