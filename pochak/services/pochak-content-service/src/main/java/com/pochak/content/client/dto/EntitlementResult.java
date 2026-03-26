package com.pochak.content.client.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Optional;

/**
 * Wrapper that distinguishes a successful entitlement check (present or absent)
 * from a service-unavailable fallback (circuit breaker open / timeout).
 */
@Getter
@AllArgsConstructor
public class EntitlementResult {

    private final Optional<CommerceEntitlementCheckResponse> response;
    private final boolean serviceUnavailable;
    private final boolean fromCache;

    /** Normal result from the commerce service. */
    public static EntitlementResult of(Optional<CommerceEntitlementCheckResponse> response) {
        return new EntitlementResult(response, false, false);
    }

    /** Cached fallback result (commerce service was down but we had a cache hit). */
    public static EntitlementResult cached(CommerceEntitlementCheckResponse cached) {
        return new EntitlementResult(Optional.of(cached), false, true);
    }

    /** Commerce service is unavailable and no cache exists. */
    public static EntitlementResult unavailable() {
        return new EntitlementResult(Optional.empty(), true, false);
    }
}
