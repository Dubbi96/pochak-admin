package com.pochak.common.event;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class InMemoryEventPublisherTest {

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @InjectMocks
    private InMemoryEventPublisher inMemoryEventPublisher;

    @Test
    @DisplayName("Should delegate publish to Spring ApplicationEventPublisher")
    void testPublish() {
        // given
        DomainEvent event = new TestDomainEvent("aggregate-123");

        // when
        inMemoryEventPublisher.publish(event);

        // then
        then(applicationEventPublisher).should().publishEvent(event);
    }

    // Concrete implementation for testing since DomainEvent is abstract
    static class TestDomainEvent extends DomainEvent {
        TestDomainEvent(String aggregateId) {
            super(aggregateId);
        }
    }
}
