package com.pochak.content.client;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.pochak.content.client.dto.CommerceEntitlementCheckResponse;
import com.pochak.content.client.dto.EntitlementResult;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Component
@Slf4j
public class CommerceEntitlementClient {

    private final RestClient commerceRestClient;

    /**
     * Local Caffeine cache for successful entitlement results.
     * Key: "sub:{userId}" or "ent:{userId}:{type}:{scopeType}:{scopeId}"
     * TTL: 5 minutes after write.
     */
    private final Cache<String, CommerceEntitlementCheckResponse> entitlementCache;

    public CommerceEntitlementClient(RestClient commerceRestClient) {
        this.commerceRestClient = commerceRestClient;
        this.entitlementCache = Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(Duration.ofMinutes(5))
                .build();
    }

    // ── subscription check ──────────────────────────────────────────────

    @CircuitBreaker(name = "commerceEntitlement", fallbackMethod = "checkSubscriptionFallback")
    public EntitlementResult checkSubscription(Long userId) {
        Map<String, Object> response = commerceRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/entitlements/check")
                        .queryParam("type", "SUBSCRIPTION")
                        .build())
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response != null && response.get("data") != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            boolean hasAccess = Boolean.TRUE.equals(data.get("hasAccess"));
            String reason = (String) data.get("reason");
            String entitlementType = (String) data.get("entitlementType");

            CommerceEntitlementCheckResponse result = new CommerceEntitlementCheckResponse(
                    hasAccess, reason, entitlementType, null, null, null);

            // Cache successful access results
            if (hasAccess) {
                entitlementCache.put(subscriptionKey(userId), result);
            }
            return EntitlementResult.of(Optional.of(result));
        }
        return EntitlementResult.of(Optional.empty());
    }

    /**
     * Fallback when circuit breaker is open or call fails.
     * Checks local cache first; if a recent successful result exists, returns it.
     * Otherwise returns an "unavailable" marker so the caller can decide on grace access.
     */
    @SuppressWarnings("unused") // called by Resilience4j reflection
    private EntitlementResult checkSubscriptionFallback(Long userId, Throwable t) {
        log.warn("Circuit breaker fallback for checkSubscription, user={}: {}", userId, t.getMessage());
        CommerceEntitlementCheckResponse cached = entitlementCache.getIfPresent(subscriptionKey(userId));
        if (cached != null) {
            log.info("Returning cached subscription result for user={}", userId);
            return EntitlementResult.cached(cached);
        }
        return EntitlementResult.unavailable();
    }

    // ── generic entitlement check ───────────────────────────────────────

    @CircuitBreaker(name = "commerceEntitlement", fallbackMethod = "checkEntitlementFallback")
    public EntitlementResult checkEntitlement(
            Long userId, String type, String scopeType, Long scopeId) {
        Map<String, Object> response = commerceRestClient.get()
                .uri(uriBuilder -> {
                    var b = uriBuilder.path("/entitlements/check");
                    if (type != null) b.queryParam("type", type);
                    if (scopeType != null) b.queryParam("scopeType", scopeType);
                    if (scopeId != null) b.queryParam("scopeId", scopeId);
                    return b.build();
                })
                .header("X-User-Id", String.valueOf(userId))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response != null && response.get("data") != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            boolean hasAccess = Boolean.TRUE.equals(data.get("hasAccess"));
            String reason = (String) data.get("reason");

            CommerceEntitlementCheckResponse result = new CommerceEntitlementCheckResponse(
                    hasAccess, reason, null, scopeType, scopeId, null);

            if (hasAccess) {
                entitlementCache.put(entitlementKey(userId, type, scopeType, scopeId), result);
            }
            return EntitlementResult.of(Optional.of(result));
        }
        return EntitlementResult.of(Optional.empty());
    }

    @SuppressWarnings("unused")
    private EntitlementResult checkEntitlementFallback(
            Long userId, String type, String scopeType, Long scopeId, Throwable t) {
        log.warn("Circuit breaker fallback for checkEntitlement, user={}, type={}: {}",
                userId, type, t.getMessage());
        CommerceEntitlementCheckResponse cached =
                entitlementCache.getIfPresent(entitlementKey(userId, type, scopeType, scopeId));
        if (cached != null) {
            log.info("Returning cached entitlement result for user={}, type={}", userId, type);
            return EntitlementResult.cached(cached);
        }
        return EntitlementResult.unavailable();
    }

    // ── cache key helpers ───────────────────────────────────────────────

    private static String subscriptionKey(Long userId) {
        return "sub:" + userId;
    }

    private static String entitlementKey(Long userId, String type, String scopeType, Long scopeId) {
        return "ent:" + userId + ":" + Objects.toString(type, "") + ":"
                + Objects.toString(scopeType, "") + ":" + Objects.toString(scopeId, "");
    }
}
