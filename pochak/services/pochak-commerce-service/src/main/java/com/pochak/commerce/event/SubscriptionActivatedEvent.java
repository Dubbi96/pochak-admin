package com.pochak.commerce.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class SubscriptionActivatedEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final String tierName;
    private final LocalDateTime expiresAt;

    public SubscriptionActivatedEvent(Long userId, String tierName, LocalDateTime expiresAt) {
        super(String.valueOf(userId));
        this.userId = userId;
        this.tierName = tierName;
        this.expiresAt = expiresAt;
    }
}
