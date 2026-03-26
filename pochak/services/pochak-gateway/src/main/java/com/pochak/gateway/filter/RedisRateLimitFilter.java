package com.pochak.gateway.filter;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Redis-backed rate limiter for gateway requests.
 * Uses Redis INCR + EXPIRE for atomic, distributed rate limiting.
 *
 * Key format: rate-limit:{clientIp}:{path-prefix}
 * TTL: 60 seconds (automatic expiry, no manual cleanup needed).
 *
 * Auth routes: 10 requests per minute (brute-force protection).
 * General API routes: 100 requests per minute.
 *
 * When Redis is unavailable, falls back to an embedded in-memory
 * ConcurrentHashMap-based limiter to prevent fail-open bypass.
 *
 * Trusted proxy validation prevents X-Forwarded-For spoofing.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "pochak.rate-limit.type", havingValue = "redis", matchIfMissing = true)
public class RedisRateLimitFilter implements GlobalFilter, Ordered {

    private static final int AUTH_MAX_REQUESTS = 10;
    private static final int API_MAX_REQUESTS = 100;
    private static final long WINDOW_MILLIS = 60_000L;
    private static final Duration WINDOW_DURATION = Duration.ofSeconds(60);
    private static final String KEY_PREFIX = "rate-limit:";

    private final ReactiveStringRedisTemplate redisTemplate;

    // --- In-memory fallback ---
    private final Map<String, TokenBucket> inMemoryFallback = new ConcurrentHashMap<>();

    // --- Trusted proxy config ---
    private final List<CidrRange> trustedProxyRanges = new ArrayList<>();

    @Value("${pochak.rate-limit.trusted-proxies:127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16}")
    private String trustedProxiesConfig;

    public RedisRateLimitFilter(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    void parseTrustedProxies() {
        String[] entries = trustedProxiesConfig.split(",");
        for (String entry : entries) {
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) continue;
            try {
                trustedProxyRanges.add(CidrRange.parse(trimmed));
            } catch (Exception e) {
                log.warn("Invalid trusted proxy CIDR '{}': {}", trimmed, e.getMessage());
            }
        }
        log.info("Loaded {} trusted proxy range(s)", trustedProxyRanges.size());
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String clientIp = resolveClientIp(exchange);

        boolean isAuthRoute = path.startsWith("/api/v1/auth");
        int maxRequests = isAuthRoute ? AUTH_MAX_REQUESTS : API_MAX_REQUESTS;
        String pathPrefix = isAuthRoute ? "auth" : "api";

        String redisKey = KEY_PREFIX + clientIp + ":" + pathPrefix;

        return checkRedisRateLimit(exchange, chain, redisKey, maxRequests, clientIp, path)
                .onErrorResume(ex -> {
                    log.warn("Redis rate limiter unavailable, using in-memory fallback: {}", ex.getMessage());
                    return checkInMemoryRateLimit(exchange, chain, clientIp, path, isAuthRoute, maxRequests);
                });
    }

    private Mono<Void> checkRedisRateLimit(ServerWebExchange exchange, GatewayFilterChain chain,
                                           String redisKey, int maxRequests,
                                           String clientIp, String path) {
        return redisTemplate.opsForValue().increment(redisKey)
                .flatMap(count -> {
                    if (count == 1) {
                        return redisTemplate.expire(redisKey, WINDOW_DURATION)
                                .thenReturn(count);
                    }
                    return Mono.just(count);
                })
                .flatMap(count -> {
                    long remaining = Math.max(0, maxRequests - count);
                    addRateLimitHeaders(exchange, maxRequests, remaining, WINDOW_DURATION.getSeconds());

                    if (count > maxRequests) {
                        log.warn("Rate limit exceeded for IP={} path={} count={}", clientIp, path, count);
                        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        exchange.getResponse().getHeaders().add("Retry-After", "60");
                        return exchange.getResponse().setComplete();
                    }
                    return chain.filter(exchange);
                });
    }

    private Mono<Void> checkInMemoryRateLimit(ServerWebExchange exchange, GatewayFilterChain chain,
                                              String clientIp, String path,
                                              boolean isAuthRoute, int maxRequests) {
        String bucketKey = clientIp + ":" + (isAuthRoute ? "auth" : "api");
        TokenBucket bucket = inMemoryFallback.computeIfAbsent(bucketKey, k -> new TokenBucket(maxRequests));

        int remainingTokens = bucket.remaining();
        long secondsUntilReset = bucket.secondsUntilReset();
        addRateLimitHeaders(exchange, maxRequests, remainingTokens, secondsUntilReset);

        if (!bucket.tryConsume()) {
            log.warn("Rate limit exceeded (in-memory fallback) for IP={} path={}", clientIp, path);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().add("Retry-After", "60");
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }

    private void addRateLimitHeaders(ServerWebExchange exchange, int limit, long remaining, long resetSeconds) {
        exchange.getResponse().getHeaders().add("X-RateLimit-Limit", String.valueOf(limit));
        exchange.getResponse().getHeaders().add("X-RateLimit-Remaining", String.valueOf(remaining));
        exchange.getResponse().getHeaders().add("X-RateLimit-Reset", String.valueOf(resetSeconds));
    }

    @Override
    public int getOrder() {
        return -3; // before CorrelationIdFilter (-2) and JwtValidationFilter
    }

    /**
     * Resolves the real client IP with trusted-proxy validation.
     *
     * Only trusts X-Forwarded-For if the direct connection IP is from a trusted proxy.
     * If the direct IP is not trusted, XFF is ignored and the direct IP is used.
     */
    private String resolveClientIp(ServerWebExchange exchange) {
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        String directIp = remoteAddress != null ? remoteAddress.getAddress().getHostAddress() : "unknown";

        if ("unknown".equals(directIp)) {
            return directIp;
        }

        // Only trust XFF if the direct connection comes from a trusted proxy
        if (isTrustedProxy(directIp)) {
            String xff = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                // Walk the XFF chain from right to left, finding the leftmost
                // IP that was added by a trusted proxy
                String[] ips = xff.split(",");
                // The rightmost entry was added by our direct connection (trusted proxy).
                // Walk backwards to find the first non-trusted IP — that's the real client.
                for (int i = ips.length - 1; i >= 0; i--) {
                    String ip = ips[i].trim();
                    if (!isTrustedProxy(ip)) {
                        return ip;
                    }
                }
                // All IPs in XFF are trusted proxies; use leftmost
                return ips[0].trim();
            }
        }

        return directIp;
    }

    private boolean isTrustedProxy(String ip) {
        try {
            InetAddress addr = InetAddress.getByName(ip);
            for (CidrRange range : trustedProxyRanges) {
                if (range.contains(addr)) {
                    return true;
                }
            }
        } catch (UnknownHostException e) {
            log.debug("Cannot parse IP for trusted-proxy check: {}", ip);
        }
        return false;
    }

    // --- In-memory token bucket (same logic as RateLimitFilter) ---

    private static class TokenBucket {
        private final int maxTokens;
        private final AtomicInteger tokens;
        private volatile long windowStart;

        TokenBucket(int maxTokens) {
            this.maxTokens = maxTokens;
            this.tokens = new AtomicInteger(maxTokens);
            this.windowStart = Instant.now().toEpochMilli();
        }

        boolean tryConsume() {
            resetIfExpired();
            return tokens.getAndDecrement() > 0;
        }

        int remaining() {
            resetIfExpired();
            return Math.max(0, tokens.get());
        }

        long secondsUntilReset() {
            long elapsed = Instant.now().toEpochMilli() - windowStart;
            long remaining = WINDOW_MILLIS - elapsed;
            return Math.max(0, remaining / 1000);
        }

        private void resetIfExpired() {
            long now = Instant.now().toEpochMilli();
            if (now - windowStart > WINDOW_MILLIS) {
                synchronized (this) {
                    if (now - windowStart > WINDOW_MILLIS) {
                        tokens.set(maxTokens);
                        windowStart = now;
                    }
                }
            }
        }
    }

    // --- CIDR range matching ---

    private static class CidrRange {
        private final byte[] networkAddress;
        private final int prefixLength;

        CidrRange(byte[] networkAddress, int prefixLength) {
            this.networkAddress = networkAddress;
            this.prefixLength = prefixLength;
        }

        static CidrRange parse(String cidr) throws UnknownHostException {
            if (cidr.contains("/")) {
                String[] parts = cidr.split("/");
                InetAddress addr = InetAddress.getByName(parts[0]);
                int prefix = Integer.parseInt(parts[1]);
                return new CidrRange(addr.getAddress(), prefix);
            } else {
                // Single IP — treat as /32 (IPv4) or /128 (IPv6)
                InetAddress addr = InetAddress.getByName(cidr);
                int prefix = addr.getAddress().length == 4 ? 32 : 128;
                return new CidrRange(addr.getAddress(), prefix);
            }
        }

        boolean contains(InetAddress address) {
            byte[] addrBytes = address.getAddress();
            if (addrBytes.length != networkAddress.length) {
                return false; // IPv4 vs IPv6 mismatch
            }

            int fullBytes = prefixLength / 8;
            int remainingBits = prefixLength % 8;

            for (int i = 0; i < fullBytes; i++) {
                if (addrBytes[i] != networkAddress[i]) {
                    return false;
                }
            }

            if (remainingBits > 0 && fullBytes < addrBytes.length) {
                int mask = 0xFF << (8 - remainingBits);
                if ((addrBytes[fullBytes] & mask) != (networkAddress[fullBytes] & mask)) {
                    return false;
                }
            }

            return true;
        }
    }

    /**
     * Periodic cleanup of stale in-memory fallback buckets to prevent memory leaks.
     * Runs every 5 minutes regardless of rate-limit type, since the in-memory map
     * is used as a fallback even when Redis is the primary limiter.
     */
    @Scheduled(fixedRate = 300_000)
    public void evictStaleBuckets() {
        long now = Instant.now().toEpochMilli();
        inMemoryFallback.entrySet().removeIf(entry ->
                now - entry.getValue().windowStart > WINDOW_MILLIS * 5);
    }
}
