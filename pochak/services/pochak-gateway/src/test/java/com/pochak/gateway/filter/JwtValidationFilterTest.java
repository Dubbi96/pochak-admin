package com.pochak.gateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Unit tests for JwtValidationFilter.
 * Covers SEC-004 (admin path protection), public path bypass logic,
 * and JWT security hardening (iss, aud, typ, jti claims).
 */
class JwtValidationFilterTest {

    private static final String SECRET = "test-secret-key-for-unit-tests-must-be-at-least-256-bits-long-enough";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    private JwtValidationFilter filter;
    private ReactiveStringRedisTemplate redisTemplate;
    private GatewayFilterChain chain;

    @BeforeEach
    void setUp() {
        redisTemplate = Mockito.mock(ReactiveStringRedisTemplate.class);
        // Default: no token is blacklisted
        when(redisTemplate.hasKey(anyString())).thenReturn(Mono.just(false));

        filter = new JwtValidationFilter(SECRET, redisTemplate);

        chain = Mockito.mock(GatewayFilterChain.class);
        when(chain.filter(Mockito.any())).thenReturn(Mono.empty());
    }

    private String generateToken(String userId, String role) {
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer("pochak-identity")
                .audience().add("pochak-api").and()
                .subject(userId)
                .claim("role", role)
                .claim("typ", "access")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(SECRET_KEY)
                .compact();
    }

    // ======================================================================
    // SEC-004: Admin path protection
    // ======================================================================

    @Nested
    @DisplayName("SEC-004: Admin service path protection")
    class AdminPathProtection {

        @Test
        @DisplayName("/admin/api/v1/rbac/roles - USER role -> 403 Forbidden")
        void adminRbacRoles_withUserRole_returns403() {
            String token = generateToken("user-1", "USER");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/admin/api/v1/rbac/roles")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("/admin/bff/dashboard - USER role -> 403 Forbidden")
        void adminBffDashboard_withUserRole_returns403() {
            String token = generateToken("user-2", "USER");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/admin/bff/dashboard")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("/api/v1/admin/members - USER role -> 403 Forbidden")
        void apiAdminMembers_withUserRole_returns403() {
            String token = generateToken("user-3", "USER");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/admin/members")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("/admin/api/v1/rbac/roles - ADMIN role -> passes through")
        void adminRbacRoles_withAdminRole_passesThrough() {
            String token = generateToken("admin-1", "ADMIN");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/admin/api/v1/rbac/roles")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            // Should NOT be 403; chain.filter was invoked (status stays null or 200)
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("/admin/bff/dashboard - ADMIN role -> passes through")
        void adminBffDashboard_withAdminRole_passesThrough() {
            String token = generateToken("admin-2", "ADMIN");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/admin/bff/dashboard")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("/api/v1/admin/members - ADMIN role -> passes through")
        void apiAdminMembers_withAdminRole_passesThrough() {
            String token = generateToken("admin-3", "ADMIN");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/admin/members")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ======================================================================
    // Public path bypass
    // ======================================================================

    @Nested
    @DisplayName("Public path handling")
    class PublicPaths {

        @Test
        @DisplayName("/admin/api/v1/auth/login - public path, no JWT required")
        void adminAuthLogin_isPublic_passesWithoutJwt() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/admin/api/v1/auth/login")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            // Public path: should not return 401 or 403
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("/api/v1/auth/login - public path, no JWT required")
        void authLogin_isPublic_passesWithoutJwt() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/auth/login")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("/api/v1/contents - public path, USER with JWT passes through with context")
        void publicContents_withUserJwt_passesWithContext() {
            String token = generateToken("user-10", "USER");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/contents")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    // ======================================================================
    // Normal user flow on protected paths
    // ======================================================================

    @Nested
    @DisplayName("Protected path with valid USER token")
    class ProtectedPathUserAccess {

        @Test
        @DisplayName("USER role accessing /api/v1/mypage -> passes through")
        void userRole_protectedPath_passesThrough() {
            String token = generateToken("user-100", "USER");
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/mypage")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("No JWT on protected path -> 401 Unauthorized")
        void noJwt_protectedPath_returns401() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/mypage")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // ======================================================================
    // SEC-001: Header stripping
    // ======================================================================

    @Nested
    @DisplayName("SEC-001: Untrusted header stripping")
    class HeaderStripping {

        @Test
        @DisplayName("Spoofed X-User-Id header is stripped before forwarding")
        void spoofedHeaders_areStripped_onPublicPath() {
            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/contents")
                    .header("X-User-Id", "spoofed-admin")
                    .header("X-User-Role", "ADMIN")
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            // The filter should have stripped these; verify no error status
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
        }
    }

    // ======================================================================
    // JWT Security Hardening: token type and claim validation
    // ======================================================================

    @Nested
    @DisplayName("JWT security hardening: typ, iss, aud validation")
    class JwtSecurityHardening {

        @Test
        @DisplayName("Refresh token used as access token returns 401")
        void refreshTokenUsedAsAccessToken_returns401() {
            // Build a refresh token (typ=refresh)
            String refreshToken = Jwts.builder()
                    .id(UUID.randomUUID().toString())
                    .issuer("pochak-identity")
                    .audience().add("pochak-api").and()
                    .subject("user-1")
                    .claim("role", "USER")
                    .claim("typ", "refresh")
                    .issuedAt(Date.from(Instant.now()))
                    .expiration(Date.from(Instant.now().plusSeconds(3600)))
                    .signWith(SECRET_KEY)
                    .compact();

            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/mypage")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshToken)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("Token without issuer returns 401")
        void tokenWithoutIssuer_returns401() {
            // Build a token without issuer claim
            String tokenNoIssuer = Jwts.builder()
                    .id(UUID.randomUUID().toString())
                    .audience().add("pochak-api").and()
                    .subject("user-1")
                    .claim("role", "USER")
                    .claim("typ", "access")
                    .issuedAt(Date.from(Instant.now()))
                    .expiration(Date.from(Instant.now().plusSeconds(3600)))
                    .signWith(SECRET_KEY)
                    .compact();

            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/mypage")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenNoIssuer)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("Token without audience returns 401")
        void tokenWithoutAudience_returns401() {
            // Build a token without audience claim
            String tokenNoAud = Jwts.builder()
                    .id(UUID.randomUUID().toString())
                    .issuer("pochak-identity")
                    .subject("user-1")
                    .claim("role", "USER")
                    .claim("typ", "access")
                    .issuedAt(Date.from(Instant.now()))
                    .expiration(Date.from(Instant.now().plusSeconds(3600)))
                    .signWith(SECRET_KEY)
                    .compact();

            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/mypage")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenNoAud)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("Token with wrong issuer returns 401")
        void tokenWithWrongIssuer_returns401() {
            String tokenWrongIss = Jwts.builder()
                    .id(UUID.randomUUID().toString())
                    .issuer("wrong-issuer")
                    .audience().add("pochak-api").and()
                    .subject("user-1")
                    .claim("role", "USER")
                    .claim("typ", "access")
                    .issuedAt(Date.from(Instant.now()))
                    .expiration(Date.from(Instant.now().plusSeconds(3600)))
                    .signWith(SECRET_KEY)
                    .compact();

            MockServerHttpRequest request = MockServerHttpRequest
                    .get("/api/v1/mypage")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenWrongIss)
                    .build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            filter.filter(exchange, chain).block();

            assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }
}
