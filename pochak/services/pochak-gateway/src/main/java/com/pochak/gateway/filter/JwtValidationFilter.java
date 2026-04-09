package com.pochak.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtValidationFilter implements GlobalFilter, Ordered {

    private static final String X_USER_ID = "X-User-Id";
    private static final String X_USER_ROLE = "X-User-Role";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String TOKEN_BLACKLIST_PREFIX = "token-blacklist:";

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/signup",
            "/api/v1/auth/social",
            "/api/v1/auth/oauth2",
            "/api/v1/auth/refresh",
            "/api/v1/auth/check-duplicate",
            "/api/v1/auth/phone/check",
            "/api/v1/auth/phone/send-code",
            "/api/v1/auth/phone/verify-code",
            "/api/v1/auth/guardian/verify",
            "/api/v1/home",
            "/api/v1/contents",
            "/api/v1/search",
            "/api/v1/competitions",
            "/api/v1/sports",
            "/api/v1/schedule",
            "/api/v1/venues",
            "/api/v1/clubs",
            "/api/v1/streaming",
            "/api/v1/communities",
            "/api/v1/matches",
            "/api/v1/teams",
            "/api/v1/organizations",
            "/api/v1/recommendations",
            "/admin/api/v1/auth",
            "/actuator",
            "/api-docs",
            "/swagger-ui"
    );

    private final SecretKey secretKey;
    private final ReactiveStringRedisTemplate redisTemplate;

    public JwtValidationFilter(@Value("${jwt.secret}") String secret,
                               ReactiveStringRedisTemplate redisTemplate) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // SEC-001: ALWAYS strip untrusted X-User-Id and X-User-Role headers first
        ServerHttpRequest cleanedRequest = request.mutate()
                .headers(h -> {
                    h.remove(X_USER_ID);
                    h.remove(X_USER_ROLE);
                })
                .build();
        ServerWebExchange cleanedExchange = exchange.mutate().request(cleanedRequest).build();

        // CORS preflight: pass through without JWT validation
        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(cleanedExchange);
        }

        String authHeader = cleanedRequest.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        boolean hasValidAuth = authHeader != null && authHeader.startsWith(BEARER_PREFIX);

        // Public path handling
        if (isPublicPath(path)) {
            if (!hasValidAuth) {
                // Public path, no JWT: pass through with clean headers (no user context)
                return chain.filter(cleanedExchange);
            }
            // Public path with JWT: try to parse and attach user context
            try {
                return buildAuthenticatedExchange(cleanedExchange, cleanedRequest, authHeader, path)
                        .flatMap(chain::filter)
                        .onErrorResume(e -> chain.filter(cleanedExchange));
            } catch (Exception e) {
                // Invalid JWT on public path: pass through without user context
                return chain.filter(cleanedExchange);
            }
        }

        // Protected path: JWT is required
        if (!hasValidAuth) {
            cleanedExchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return cleanedExchange.getResponse().setComplete();
        }

        try {
            return buildAuthenticatedExchange(cleanedExchange, cleanedRequest, authHeader, path)
                    .flatMap(chain::filter)
                    .onErrorResume(SecurityException.class, e -> {
                        cleanedExchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                        return cleanedExchange.getResponse().setComplete();
                    })
                    .onErrorResume(e -> {
                        cleanedExchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return cleanedExchange.getResponse().setComplete();
                    });
        } catch (SecurityException e) {
            cleanedExchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return cleanedExchange.getResponse().setComplete();
        } catch (Exception e) {
            cleanedExchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return cleanedExchange.getResponse().setComplete();
        }
    }

    /**
     * Parses JWT, checks token blacklist, enforces admin role check,
     * and returns exchange with X-User-Id/X-User-Role headers.
     */
    private Mono<ServerWebExchange> buildAuthenticatedExchange(
            ServerWebExchange exchange, ServerHttpRequest request, String authHeader, String path) {

        String token = authHeader.substring(BEARER_PREFIX.length());

        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String userId = claims.getSubject();
        String role = claims.get("role", String.class);

        // SEC-004: Admin endpoints require ADMIN role
        if (path.startsWith("/api/v1/admin") && !"ADMIN".equalsIgnoreCase(role)) {
            throw new SecurityException("Forbidden: ADMIN role required");
        }

        // SEC-002: Check Redis-based token blacklist
        return isTokenBlacklisted(userId)
                .flatMap(blacklisted -> {
                    if (blacklisted) {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        exchange.getResponse().getHeaders().add("X-Auth-Error", "Token has been revoked");
                        return Mono.error(new RuntimeException("Token has been revoked"));
                    }

                    ServerHttpRequest mutatedRequest = request.mutate()
                            .header(X_USER_ID, userId)
                            .header(X_USER_ROLE, role)
                            .build();

                    return Mono.just(exchange.mutate().request(mutatedRequest).build());
                });
    }

    /**
     * SEC-002: Checks if the user's token has been blacklisted in Redis.
     * Blacklist entries are populated by the identity service on logout/block
     * with a TTL matching the access token's remaining lifetime.
     */
    private Mono<Boolean> isTokenBlacklisted(String userId) {
        return redisTemplate.hasKey(TOKEN_BLACKLIST_PREFIX + userId);
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
