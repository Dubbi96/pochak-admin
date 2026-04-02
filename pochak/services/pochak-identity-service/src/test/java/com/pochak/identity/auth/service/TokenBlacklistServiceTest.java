package com.pochak.identity.auth.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenBlacklistServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private TokenBlacklistService tokenBlacklistService;

    // ==================== blacklist tests ====================

    @Test
    @DisplayName("blacklist() should store token in Redis with key token-blacklist:{userId}")
    void blacklist_shouldStoreTokenWithCorrectKey() {
        // given
        Long userId = 1L;
        String accessToken = "jwt-access-token-value";
        long ttlSeconds = 1800L;

        given(redisTemplate.opsForValue()).willReturn(valueOperations);

        // when
        tokenBlacklistService.blacklist(userId, accessToken, ttlSeconds);

        // then
        verify(valueOperations).set(
                eq("token-blacklist:1"),
                eq(accessToken),
                eq(Duration.ofSeconds(1800))
        );
    }

    @Test
    @DisplayName("blacklist() should set TTL matching the token's remaining validity period")
    void blacklist_shouldSetCorrectTtl() {
        // given
        Long userId = 42L;
        String accessToken = "some-token";
        long ttlSeconds = 600L; // 10 minutes remaining

        given(redisTemplate.opsForValue()).willReturn(valueOperations);

        // when
        tokenBlacklistService.blacklist(userId, accessToken, ttlSeconds);

        // then
        ArgumentCaptor<Duration> durationCaptor = ArgumentCaptor.forClass(Duration.class);
        verify(valueOperations).set(eq("token-blacklist:42"), eq("some-token"), durationCaptor.capture());
        assertThat(durationCaptor.getValue()).isEqualTo(Duration.ofSeconds(600));
    }

    @Test
    @DisplayName("blacklist() should skip when ttlSeconds is zero or negative (already expired)")
    void blacklist_shouldSkipWhenTokenAlreadyExpired() {
        // given
        Long userId = 1L;
        String accessToken = "expired-token";

        // when
        tokenBlacklistService.blacklist(userId, accessToken, 0);
        tokenBlacklistService.blacklist(userId, accessToken, -10);

        // then
        verify(redisTemplate, never()).opsForValue();
    }

    // ==================== isBlacklisted tests ====================

    @Test
    @DisplayName("isBlacklisted() should return true when blacklisted token exists")
    void isBlacklisted_shouldReturnTrueWhenKeyExists() {
        // given
        Long userId = 1L;
        given(redisTemplate.hasKey("token-blacklist:1")).willReturn(Boolean.TRUE);

        // when
        boolean result = tokenBlacklistService.isBlacklisted(userId);

        // then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("isBlacklisted() should return false when no blacklisted token exists")
    void isBlacklisted_shouldReturnFalseWhenKeyNotExists() {
        // given
        Long userId = 99L;
        given(redisTemplate.hasKey("token-blacklist:99")).willReturn(Boolean.FALSE);

        // when
        boolean result = tokenBlacklistService.isBlacklisted(userId);

        // then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("isBlacklisted() should return false when hasKey returns null")
    void isBlacklisted_shouldReturnFalseWhenHasKeyReturnsNull() {
        // given
        Long userId = 7L;
        given(redisTemplate.hasKey("token-blacklist:7")).willReturn(null);

        // when
        boolean result = tokenBlacklistService.isBlacklisted(userId);

        // then
        assertThat(result).isFalse();
    }
}
