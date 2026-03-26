package com.pochak.gateway.filter;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory rate limiter for gateway requests.
 * Tracks request counts per client IP within sliding time windows.
 *
 * Auth routes: 10 requests per minute (brute-force protection).
 * General API routes: 100 requests per minute.
 *
 * Trusted proxy validation prevents X-Forwarded-For spoofing.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "pochak.rate-limit.type", havingValue = "in-memory")
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final int AUTH_MAX_REQUESTS = 10;
    private static final int API_MAX_REQUESTS = 100;
    private static final long WINDOW_MILLIS = 60_000L; // 1 minute

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    // --- Trusted proxy config ---
    private final List<CidrRange> trustedProxyRanges = new ArrayList<>();

    @Value("${pochak.rate-limit.trusted-proxies:127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16}")
    private String trustedProxiesConfig;

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

        String bucketKey = clientIp + ":" + (isAuthRoute ? "auth" : "api");

        TokenBucket bucket = buckets.computeIfAbsent(bucketKey, k -> new TokenBucket(maxRequests));

        long secondsUntilReset = bucket.secondsUntilReset();
        int remaining = bucket.remaining();
        addRateLimitHeaders(exchange, maxRequests, remaining, secondsUntilReset);

        if (!bucket.tryConsume()) {
            log.warn("Rate limit exceeded for IP={} path={}", clientIp, path);
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
     */
    private String resolveClientIp(ServerWebExchange exchange) {
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        String directIp = remoteAddress != null ? remoteAddress.getAddress().getHostAddress() : "unknown";

        if ("unknown".equals(directIp)) {
            return directIp;
        }

        if (isTrustedProxy(directIp)) {
            String xff = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                String[] ips = xff.split(",");
                for (int i = ips.length - 1; i >= 0; i--) {
                    String ip = ips[i].trim();
                    if (!isTrustedProxy(ip)) {
                        return ip;
                    }
                }
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

    /**
     * Simple token-bucket implementation with automatic refill on window expiry.
     */
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

    /**
     * Periodic cleanup of stale buckets to prevent memory leaks.
     */
    public void evictStaleBuckets() {
        long now = Instant.now().toEpochMilli();
        buckets.entrySet().removeIf(entry ->
                now - entry.getValue().windowStart > WINDOW_MILLIS * 5);
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
                InetAddress addr = InetAddress.getByName(cidr);
                int prefix = addr.getAddress().length == 4 ? 32 : 128;
                return new CidrRange(addr.getAddress(), prefix);
            }
        }

        boolean contains(InetAddress address) {
            byte[] addrBytes = address.getAddress();
            if (addrBytes.length != networkAddress.length) {
                return false;
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
}
