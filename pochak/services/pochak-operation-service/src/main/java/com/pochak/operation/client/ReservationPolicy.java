package com.pochak.operation.client;

/**
 * M8: Organization reservation policy for venue booking authorization.
 */
public enum ReservationPolicy {
    /** Any member of the organization can make reservations */
    ALL_MEMBERS,
    /** Only MANAGER and OWNER roles can make reservations */
    MANAGER_ONLY
}
