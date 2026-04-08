package com.pochak.identity.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
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

    // ==================== Standard claims (iss, aud, typ, jti) ====================

    @Nested
    @DisplayName("Standard JWT claims (iss, aud, typ, jti)")
    class StandardClaims {

        @Test
        @DisplayName("Access token contains iss=pochak-identity claim")
        void accessTokenShouldHaveIssuerClaim() {
            // when
            String token = jwtTokenProvider.generateAccessToken(1L, "USER");

            // then
            Claims claims = jwtTokenProvider.parseAccessToken(token);
            assertThat(claims.getIssuer()).isEqualTo("pochak-identity");
        }

        @Test
        @DisplayName("Access token contains aud=pochak-api claim")
        void accessTokenShouldHaveAudienceClaim() {
            // when
            String token = jwtTokenProvider.generateAccessToken(1L, "USER");

            // then
            Claims claims = jwtTokenProvider.parseAccessToken(token);
            assertThat(claims.getAudience()).contains("pochak-api");
        }

        @Test
        @DisplayName("Access token contains typ=access claim")
        void accessTokenShouldHaveTypAccessClaim() {
            // when
            String token = jwtTokenProvider.generateAccessToken(1L, "USER");

            // then
            Claims claims = jwtTokenProvider.parseAccessToken(token);
            assertThat(claims.get("typ", String.class)).isEqualTo("access");
        }

        @Test
        @DisplayName("Refresh token contains typ=refresh claim")
        void refreshTokenShouldHaveTypRefreshClaim() {
            // when
            String token = jwtTokenProvider.generateRefreshToken(1L);

            // then
            Claims claims = jwtTokenProvider.parseRefreshToken(token);
            assertThat(claims.get("typ", String.class)).isEqualTo("refresh");
        }

        @Test
        @DisplayName("Access token contains non-null jti claim")
        void accessTokenShouldHaveJtiClaim() {
            // when
            String token = jwtTokenProvider.generateAccessToken(1L, "USER");

            // then
            Claims claims = jwtTokenProvider.parseAccessToken(token);
            assertThat(claims.getId()).isNotNull().isNotBlank();
        }

        @Test
        @DisplayName("Refresh token contains non-null jti claim")
        void refreshTokenShouldHaveJtiClaim() {
            // when
            String token = jwtTokenProvider.generateRefreshToken(1L);

            // then
            Claims claims = jwtTokenProvider.parseRefreshToken(token);
            assertThat(claims.getId()).isNotNull().isNotBlank();
        }

        @Test
        @DisplayName("Refresh token contains iss=pochak-identity and aud=pochak-api")
        void refreshTokenShouldHaveIssuerAndAudience() {
            // when
            String token = jwtTokenProvider.generateRefreshToken(1L);

            // then
            Claims claims = jwtTokenProvider.parseRefreshToken(token);
            assertThat(claims.getIssuer()).isEqualTo("pochak-identity");
            assertThat(claims.getAudience()).contains("pochak-api");
        }

        @Test
        @DisplayName("Signup token contains iss=pochak-identity and aud=pochak-api")
        void signupTokenShouldHaveIssuerAndAudience() {
            // when
            String token = jwtTokenProvider.generateSignupToken(
                    "kakao", "12345", "test@test.com", "Test", null);

            // then
            Claims claims = jwtTokenProvider.parseToken(token);
            assertThat(claims.getIssuer()).isEqualTo("pochak-identity");
            assertThat(claims.getAudience()).contains("pochak-api");
        }

        @Test
        @DisplayName("getJtiFromToken returns the jti from a token")
        void getJtiFromTokenShouldReturnJti() {
            // given
            String token = jwtTokenProvider.generateAccessToken(1L, "USER");

            // when
            String jti = jwtTokenProvider.getJtiFromToken(token);

            // then
            assertThat(jti).isNotNull().isNotBlank();
        }
    }

    // ==================== Unique JTI ====================

    @Nested
    @DisplayName("Unique JTI per token")
    class UniqueJti {

        @Test
        @DisplayName("Two access tokens for the same user have different jti values")
        void twoAccessTokensShouldHaveDifferentJti() {
            // when
            String token1 = jwtTokenProvider.generateAccessToken(1L, "USER");
            String token2 = jwtTokenProvider.generateAccessToken(1L, "USER");

            // then
            String jti1 = jwtTokenProvider.getJtiFromToken(token1);
            String jti2 = jwtTokenProvider.getJtiFromToken(token2);
            assertThat(jti1).isNotEqualTo(jti2);
        }

        @Test
        @DisplayName("Access token and refresh token have different jti values")
        void accessAndRefreshTokensShouldHaveDifferentJti() {
            // when
            String accessToken = jwtTokenProvider.generateAccessToken(1L, "USER");
            String refreshToken = jwtTokenProvider.generateRefreshToken(1L);

            // then
            String accessJti = jwtTokenProvider.getJtiFromToken(accessToken);
            String refreshJti = jwtTokenProvider.getJtiFromToken(refreshToken);
            assertThat(accessJti).isNotEqualTo(refreshJti);
        }
    }

    // ==================== Token type separation ====================

    @Nested
    @DisplayName("Token type separation (parseAccessToken / parseRefreshToken)")
    class TokenTypeSeparation {

        @Test
        @DisplayName("parseAccessToken rejects refresh token")
        void parseAccessTokenShouldRejectRefreshToken() {
            // given
            String refreshToken = jwtTokenProvider.generateRefreshToken(1L);

            // when & then
            assertThatThrownBy(() -> jwtTokenProvider.parseAccessToken(refreshToken))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Expected access token");
        }

        @Test
        @DisplayName("parseRefreshToken rejects access token")
        void parseRefreshTokenShouldRejectAccessToken() {
            // given
            String accessToken = jwtTokenProvider.generateAccessToken(1L, "USER");

            // when & then
            assertThatThrownBy(() -> jwtTokenProvider.parseRefreshToken(accessToken))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Expected refresh token");
        }

        @Test
        @DisplayName("parseAccessToken accepts valid access token")
        void parseAccessTokenShouldAcceptAccessToken() {
            // given
            String accessToken = jwtTokenProvider.generateAccessToken(1L, "USER");

            // when
            Claims claims = jwtTokenProvider.parseAccessToken(accessToken);

            // then
            assertThat(claims.getSubject()).isEqualTo("1");
            assertThat(claims.get("role", String.class)).isEqualTo("USER");
        }

        @Test
        @DisplayName("parseRefreshToken accepts valid refresh token")
        void parseRefreshTokenShouldAcceptRefreshToken() {
            // given
            String refreshToken = jwtTokenProvider.generateRefreshToken(1L);

            // when
            Claims claims = jwtTokenProvider.parseRefreshToken(refreshToken);

            // then
            assertThat(claims.getSubject()).isEqualTo("1");
        }
    }

    /**
     * JWT 헤더를 파싱하여 Map으로 반환 (requireIssuer/requireAudience 포함)
     */
    private Map<String, Object> parseJwtHeader(String token) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer("pochak-identity")
                .requireAudience("pochak-api")
                .build()
                .parseSignedClaims(token)
                .getHeader();
    }
}
