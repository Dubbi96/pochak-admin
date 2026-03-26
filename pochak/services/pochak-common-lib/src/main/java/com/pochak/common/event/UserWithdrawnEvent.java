package com.pochak.common.event;

import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Event published when a user withdraws from the platform.
 * Consuming services use this to clean up user-related data per retention policy.
 *
 * Routing key: "identity.UserWithdrawnEvent"
 * This event lives in common-lib so all consuming services can deserialize it.
 */
@Getter
public class UserWithdrawnEvent extends DomainEvent {

    private static final long serialVersionUID = 1L;

    public static final String ROUTING_KEY = "identity.UserWithdrawnEvent";

    private final Long userId;
    private final String emailHash;       // SHA-256 hash for re-registration prevention
    private final LocalDateTime withdrawnAt;

    public UserWithdrawnEvent(Long userId, String emailHash, LocalDateTime withdrawnAt) {
        super("identity.UserWithdrawnEvent", String.valueOf(userId));
        this.userId = userId;
        this.emailHash = emailHash;
        this.withdrawnAt = withdrawnAt;
    }
}
