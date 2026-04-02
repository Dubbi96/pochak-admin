package com.pochak.identity.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    // 256-bit key (32 bytes) for HS256
    private static final String SECRET = "pochak-test-secret-key-must-be-at-least-32-bytes-long!!";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, 1800000L, 2592000000L);
    }

    // ==================== L3: JWT HS256 명시적 지정 ====================

    @Nested
    @DisplayName("JWT HS256 알고리즘 명시적 지정")
    class Hs256Algorithm {

        @Test
        @DisplayName("생성된 access token 헤더에 alg:HS256 확인")
        void accessTokenShouldHaveHs256Algorithm() {
            // when
            String token = jwtTokenProvider.generateAccessToken(1L, "USER");

            // then
            Map<String, Object> header = parseJwtHeader(token);
            assertThat(header.get("alg")).isEqualTo("HS256");
        }

        @Test
        @DisplayName("생성된 refresh token 헤더에 alg:HS256 확인")
        void refreshTokenShouldHaveHs256Algorithm() {
            // when
            String token = jwtTokenProvider.generateRefreshToken(1L);

            // then
            Map<String, Object> header = parseJwtHeader(token);
            assertThat(header.get("alg")).isEqualTo("HS256");
        }

        @Test
        @DisplayName("생성된 signup token 헤더에 alg:HS256 확인")
        void signupTokenShouldHaveHs256Algorithm() {
            // when
            String token = jwtTokenProvider.generateSignupToken(
                    "kakao", "12345", "test@test.com", "Test", null);

            // then
            Map<String, Object> header = parseJwtHeader(token);
            assertThat(header.get("alg")).isEqualTo("HS256");
        }

        @Test
        @DisplayName("다른 알고리즘(HS384)으로 서명된 토큰 거부")
        void shouldRejectTokenSignedWithDifferentAlgorithm() {
            // given - HS384로 서명된 토큰 생성
            // 384-bit key (48 bytes) needed for HS384
            String longSecret = SECRET + "extra-bytes-for-hs384!!";
            SecretKey hs384Key = Keys.hmacShaKeyFor(longSecret.getBytes(StandardCharsets.UTF_8));

            String hs384Token = Jwts.builder()
                    .subject("1")
                    .claim("role", "USER")
                    .signWith(hs384Key, Jwts.SIG.HS384)
                    .compact();

            // when & then
            assertThat(jwtTokenProvider.validateToken(hs384Token)).isFalse();
        }

        @Test
        @DisplayName("정상 HS256 토큰은 검증 통과")
        void shouldAcceptValidHs256Token() {
            // given
            String token = jwtTokenProvider.generateAccessToken(42L, "ADMIN");

            // when
            boolean valid = jwtTokenProvider.validateToken(token);

            // then
            assertThat(valid).isTrue();
            assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(42L);
            assertThat(jwtTokenProvider.getRoleFromToken(token)).isEqualTo("ADMIN");
        }
    }

    /**
     * JWT 헤더를 파싱하여 Map으로 반환 (Base64 디코딩)
     */
    private Map<String, Object> parseJwtHeader(String token) {
        String headerPart = token.split("\\.")[0];
        // JWT uses Base64URL encoding
        byte[] decoded = Base64.getUrlDecoder().decode(headerPart);
        String headerJson = new String(decoded, StandardCharsets.UTF_8);

        // Simple JSON parsing for {"alg":"HS256","typ":"JWT"}
        // Use the jjwt parser to get header properly
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getHeader();
    }
}
