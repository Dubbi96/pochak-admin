package com.pochak.common.event;

public interface EventPublisher {

    void publish(DomainEvent event);
}
