package com.pochak.content.competition.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Application-level rate limiter for invite code attempts.
 * Limits: 5 attempts per user per 10 minutes, 20 attempts per IP per 10 minutes.
 */
@Component
public class InviteCodeRateLimiter {

    private static final int USER_LIMIT = 5;
    private static final int IP_LIMIT = 20;

    private final Cache<String, AtomicInteger> attempts = Caffeine.newBuilder()
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .build();

    /**
     * Check if the given key is allowed to make another attempt.
     * Keys should be prefixed with "user:" or "ip:" to distinguish limit tiers.
     *
     * @param key the rate limit key (e.g. "user:123" or "ip:192.168.1.1")
     * @return true if the attempt is allowed, false if rate limit exceeded
     */
    public boolean isAllowed(String key) {
        AtomicInteger count = attempts.get(key, k -> new AtomicInteger(0));
        return count.incrementAndGet() <= getLimit(key);
    }

    private int getLimit(String key) {
        return key.startsWith("user:") ? USER_LIMIT : IP_LIMIT;
    }
}
