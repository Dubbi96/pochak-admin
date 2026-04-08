package com.pochak.identity.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String KEY_PREFIX = "token-blacklist:";
    private static final String JTI_PREFIX = KEY_PREFIX + "jti:";

    private final StringRedisTemplate redisTemplate;

    public void blacklistByJti(String jti, long ttlSeconds) {
        if (jti == null || ttlSeconds <= 0) {
            return;
        }
        redisTemplate.opsForValue().set(JTI_PREFIX + jti, "revoked", Duration.ofSeconds(ttlSeconds));
        log.info("Blacklisted token jti={}, ttl={}s", jti, ttlSeconds);
    }

    public void blacklistByUserId(Long userId, long ttlSeconds) {
        if (ttlSeconds <= 0) {
            return;
        }
        redisTemplate.opsForValue().set(KEY_PREFIX + userId, "revoked", Duration.ofSeconds(ttlSeconds));
        log.info("Blacklisted all tokens for userId={}, ttl={}s", userId, ttlSeconds);
    }

    public boolean isBlacklistedByJti(String jti) {
        if (jti == null) return false;
        return Boolean.TRUE.equals(redisTemplate.hasKey(JTI_PREFIX + jti));
    }

    public boolean isBlacklistedByUserId(Long userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + userId));
    }
}
