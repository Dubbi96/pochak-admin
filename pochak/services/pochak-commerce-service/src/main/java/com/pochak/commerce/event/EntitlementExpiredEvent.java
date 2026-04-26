package com.pochak.commerce.event;

import com.pochak.common.event.DomainEvent;
import lombok.Getter;

/**
 * Event published when an entitlement is revoked or expires.
 * Consumed by content-service to withdraw access to restricted content in real time.
 *
 * Routing key: "commerce.EntitlementExpiredEvent"
 */
@Getter
public class EntitlementExpiredEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final Long entitlementId;
    private final String entitlementType;
    private final String scopeType;
    private final Long scopeId;

    public EntitlementExpiredEvent(Long userId, Long entitlementId, String entitlementType,
                                   String scopeType, Long scopeId) {
        super(String.valueOf(entitlementId));
        this.userId = userId;
        this.entitlementId = entitlementId;
        this.entitlementType = entitlementType;
        this.scopeType = scopeType;
        this.scopeId = scopeId;
    }
}
