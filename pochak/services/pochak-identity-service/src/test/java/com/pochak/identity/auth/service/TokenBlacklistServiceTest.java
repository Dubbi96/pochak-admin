package com.pochak.identity.auth.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

    // ==================== blacklistByJti tests ====================

    @Nested
    @DisplayName("blacklistByJti")
    class BlacklistByJti {

        @Test
        @DisplayName("should store jti in Redis with key token-blacklist:jti:{jti}")
        void blacklistByJti_shouldStoreWithCorrectKey() {
            // given
            String jti = "abc-123-def";
            long ttlSeconds = 1800L;
            given(redisTemplate.opsForValue()).willReturn(valueOperations);

            // when
            tokenBlacklistService.blacklistByJti(jti, ttlSeconds);

            // then
            verify(valueOperations).set(
                    eq("token-blacklist:jti:abc-123-def"),
                    eq("revoked"),
                    eq(Duration.ofSeconds(1800))
            );
        }

        @Test
        @DisplayName("should skip when ttlSeconds is zero or negative")
        void blacklistByJti_shouldSkipWhenExpired() {
            // when
            tokenBlacklistService.blacklistByJti("some-jti", 0);
            tokenBlacklistService.blacklistByJti("some-jti", -10);

            // then
            verify(redisTemplate, never()).opsForValue();
        }

        @Test
        @DisplayName("should skip when jti is null")
        void blacklistByJti_shouldSkipWhenJtiIsNull() {
            // when
            tokenBlacklistService.blacklistByJti(null, 1800);

            // then
            verify(redisTemplate, never()).opsForValue();
        }
    }

    // ==================== blacklistByUserId tests ====================

    @Nested
    @DisplayName("blacklistByUserId")
    class BlacklistByUserId {

        @Test
        @DisplayName("should store userId in Redis with key token-blacklist:{userId}")
        void blacklistByUserId_shouldStoreWithCorrectKey() {
            // given
            Long userId = 42L;
            long ttlSeconds = 600L;
            given(redisTemplate.opsForValue()).willReturn(valueOperations);

            // when
            tokenBlacklistService.blacklistByUserId(userId, ttlSeconds);

            // then
            verify(valueOperations).set(
                    eq("token-blacklist:42"),
                    eq("revoked"),
                    eq(Duration.ofSeconds(600))
            );
        }

        @Test
        @DisplayName("should skip when ttlSeconds is zero or negative")
        void blacklistByUserId_shouldSkipWhenExpired() {
            // when
            tokenBlacklistService.blacklistByUserId(1L, 0);
            tokenBlacklistService.blacklistByUserId(1L, -5);

            // then
            verify(redisTemplate, never()).opsForValue();
        }
    }

    // ==================== isBlacklistedByJti tests ====================

    @Nested
    @DisplayName("isBlacklistedByJti")
    class IsBlacklistedByJti {

        @Test
        @DisplayName("should return true when jti is blacklisted")
        void isBlacklistedByJti_shouldReturnTrueWhenExists() {
            // given
            given(redisTemplate.hasKey("token-blacklist:jti:abc-123")).willReturn(Boolean.TRUE);

            // when
            boolean result = tokenBlacklistService.isBlacklistedByJti("abc-123");

            // then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when jti is not blacklisted")
        void isBlacklistedByJti_shouldReturnFalseWhenNotExists() {
            // given
            given(redisTemplate.hasKey("token-blacklist:jti:xyz-999")).willReturn(Boolean.FALSE);

            // when
            boolean result = tokenBlacklistService.isBlacklistedByJti("xyz-999");

            // then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should return false when jti is null")
        void isBlacklistedByJti_shouldReturnFalseWhenJtiIsNull() {
            // when
            boolean result = tokenBlacklistService.isBlacklistedByJti(null);

            // then
            assertThat(result).isFalse();
        }
    }

    // ==================== isBlacklistedByUserId tests ====================

    @Nested
    @DisplayName("isBlacklistedByUserId")
    class IsBlacklistedByUserId {

        @Test
        @DisplayName("should return true when userId is blacklisted")
        void isBlacklistedByUserId_shouldReturnTrueWhenExists() {
            // given
            given(redisTemplate.hasKey("token-blacklist:1")).willReturn(Boolean.TRUE);

            // when
            boolean result = tokenBlacklistService.isBlacklistedByUserId(1L);

            // then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when userId is not blacklisted")
        void isBlacklistedByUserId_shouldReturnFalseWhenNotExists() {
            // given
            given(redisTemplate.hasKey("token-blacklist:99")).willReturn(Boolean.FALSE);

            // when
            boolean result = tokenBlacklistService.isBlacklistedByUserId(99L);

            // then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should return false when hasKey returns null")
        void isBlacklistedByUserId_shouldReturnFalseWhenNull() {
            // given
            given(redisTemplate.hasKey("token-blacklist:7")).willReturn(null);

            // when
            boolean result = tokenBlacklistService.isBlacklistedByUserId(7L);

            // then
            assertThat(result).isFalse();
        }
    }
}
