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
 * Window and limits are configurable (see application.yml pochak.rate-limit.*).
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

    private static final String KEY_PREFIX = "rate-limit:";

    private final ReactiveStringRedisTemplate redisTemplate;

    // --- In-memory fallback ---
    private final Map<String, TokenBucket> inMemoryFallback = new ConcurrentHashMap<>();

    // --- Trusted proxy config ---
    private final List<CidrRange> trustedProxyRanges = new ArrayList<>();

    @Value("${pochak.rate-limit.trusted-proxies:127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16}")
    private String trustedProxiesConfig;

    @Value("${pochak.rate-limit.api-max-requests:100}")
    private int apiMaxRequests;

    @Value("${pochak.rate-limit.auth-max-requests:10}")
    private int authMaxRequests;

    @Value("${pochak.rate-limit.window-seconds:60}")
    private int windowSeconds;

    @Value("${pochak.rate-limit.skip-loopback-clients:false}")
    private boolean skipLoopbackClients;

    private Duration windowDuration;
    private long windowMillis;

    public RedisRateLimitFilter(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    void initWindowAndParseProxies() {
        this.windowSeconds = Math.max(1, windowSeconds);
        this.windowDuration = Duration.ofSeconds(windowSeconds);
        this.windowMillis = windowDuration.toMillis();
        parseTrustedProxies();
    }

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

        if (skipLoopbackClients && isLoopbackClient(clientIp)) {
            return chain.filter(exchange);
        }

        // OAuth callback/authorize paths are excluded from strict auth rate limit
        // — these are redirects from OAuth providers (Google, Kakao, Naver), not user-initiated brute force
        boolean isOAuthCallback = path.startsWith("/api/v1/auth/oauth2/callback")
                || path.startsWith("/api/v1/auth/oauth2/authorize");
        boolean isAuthRoute = !isOAuthCallback && path.startsWith("/api/v1/auth");
        int maxRequests = isAuthRoute ? authMaxRequests : apiMaxRequests;
        String pathPrefix = isAuthRoute ? "auth" : "api";

        String redisKey = KEY_PREFIX + clientIp + ":" + pathPrefix;

        return checkRedisRateLimit(exchange, chain, redisKey, maxRequests, clientIp, path)
                .onErrorResume(ex -> {
                    log.warn("Redis rate limiter unavailable, using in-memory fallback: {}", ex.getMessage());
                    return checkInMemoryRateLimit(exchange, chain, clientIp, path, isAuthRoute, maxRequests);
                });
    }

    private boolean isLoopbackClient(String clientIp) {
        if ("unknown".equals(clientIp)) {
            return false;
        }
        try {
            return InetAddress.getByName(clientIp).isLoopbackAddress();
        } catch (UnknownHostException e) {
            return false;
        }
    }

    private Mono<Void> checkRedisRateLimit(ServerWebExchange exchange, GatewayFilterChain chain,
                                           String redisKey, int maxRequests,
                                           String clientIp, String path) {
        return redisTemplate.opsForValue().increment(redisKey)
                .flatMap(count -> {
                    if (count == 1) {
                        return redisTemplate.expire(redisKey, windowDuration)
                                .thenReturn(count);
                    }
                    return Mono.just(count);
                })
                .flatMap(count -> {
                    long remaining = Math.max(0, maxRequests - count);
                    addRateLimitHeaders(exchange, maxRequests, remaining, windowSeconds);

                    if (count > maxRequests) {
                        log.warn("Rate limit exceeded for IP={} path={} count={}", clientIp, path, count);
                        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        exchange.getResponse().getHeaders().add("Retry-After", String.valueOf(windowSeconds));
                        return exchange.getResponse().setComplete();
                    }
                    return chain.filter(exchange);
                });
    }

    private Mono<Void> checkInMemoryRateLimit(ServerWebExchange exchange, GatewayFilterChain chain,
                                              String clientIp, String path,
                                              boolean isAuthRoute, int maxRequests) {
        String bucketKey = clientIp + ":" + (isAuthRoute ? "auth" : "api");
        TokenBucket bucket = inMemoryFallback.computeIfAbsent(bucketKey,
                k -> new TokenBucket(maxRequests, windowMillis));

        int remainingTokens = bucket.remaining();
        long secondsUntilReset = bucket.secondsUntilReset();
        addRateLimitHeaders(exchange, maxRequests, remainingTokens, secondsUntilReset);

        if (!bucket.tryConsume()) {
            log.warn("Rate limit exceeded (in-memory fallback) for IP={} path={}", clientIp, path);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().add("Retry-After", String.valueOf(windowSeconds));
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
        private final long windowMillis;
        private final AtomicInteger tokens;
        private volatile long windowStart;

        TokenBucket(int maxTokens, long windowMillis) {
            this.maxTokens = maxTokens;
            this.windowMillis = windowMillis;
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
            long remaining = windowMillis - elapsed;
            return Math.max(0, remaining / 1000);
        }

        private void resetIfExpired() {
            long now = Instant.now().toEpochMilli();
            if (now - windowStart > windowMillis) {
                synchronized (this) {
                    if (now - windowStart > windowMillis) {
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
                now - entry.getValue().windowStart > windowMillis * 5);
    }
}
