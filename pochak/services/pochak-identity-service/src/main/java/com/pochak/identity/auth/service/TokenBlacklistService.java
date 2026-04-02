package com.pochak.identity.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis-backed token blacklist.
 * When a user logs out or withdraws, their access token is blacklisted
 * so it cannot be reused until natural expiration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String KEY_PREFIX = "token-blacklist:";

    private final StringRedisTemplate redisTemplate;

    /**
     * Add a user's access token to the blacklist with a TTL matching
     * the token's remaining validity period.
     *
     * @param userId      the user whose token is being blacklisted
     * @param accessToken the JWT access token to blacklist
     * @param ttlSeconds  seconds until the token expires naturally
     */
    public void blacklist(Long userId, String accessToken, long ttlSeconds) {
        if (ttlSeconds <= 0) {
            log.debug("Token already expired for userId={}, skipping blacklist", userId);
            return;
        }
        String key = KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(key, accessToken, Duration.ofSeconds(ttlSeconds));
        log.info("Blacklisted token for userId={}, ttl={}s", userId, ttlSeconds);
    }

    /**
     * Check whether a user currently has a blacklisted token.
     *
     * @param userId the user to check
     * @return true if a blacklisted token entry exists for the user
     */
    public boolean isBlacklisted(Long userId) {
        String key = KEY_PREFIX + userId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
