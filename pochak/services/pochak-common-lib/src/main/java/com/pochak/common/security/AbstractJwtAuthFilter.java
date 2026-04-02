package com.pochak.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;

/**
 * Abstract JWT authentication filter for servlet-based services (BFF / domain services).
 *
 * <p>Reads the {@code Authorization: Bearer <token>} header, validates the JWT signature,
 * checks a Redis token blacklist, extracts user identity from claims, and populates both
 * Spring Security's {@code SecurityContext} and the common-lib {@link UserContextHolder}.</p>
 *
 * <h3>Subclass contract</h3>
 * <ul>
 *     <li>{@link #getPublicPaths()} &mdash; return URL path patterns that should skip authentication</li>
 *     <li>{@link #extractAuthorities(Claims)} &mdash; extract granted authorities from JWT claims.
 *         User services typically return a single authority from a {@code role} claim;
 *         admin services may return multiple authorities from a {@code roles} list claim.</li>
 * </ul>
 *
 * <h3>Redis blacklist</h3>
 * <p>On logout, services store a key {@code token-blacklist:{userId}} in Redis. If this key
 * exists when a request arrives, the token is considered revoked and authentication fails
 * with HTTP 401.</p>
 */
@Slf4j
public abstract class AbstractJwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String BLACKLIST_KEY_PREFIX = "token-blacklist:";

    private final SecretKey signingKey;
    private final StringRedisTemplate redisTemplate;

    /**
     * @param jwtSecret     the HMAC-SHA secret used to sign and verify JWTs
     * @param redisTemplate Redis template for token blacklist lookups
     */
    protected AbstractJwtAuthFilter(String jwtSecret, StringRedisTemplate redisTemplate) {
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.redisTemplate = redisTemplate;
    }

    /**
     * Returns URL path patterns that should bypass JWT authentication entirely.
     * Examples: {@code List.of("/api/v1/auth/**", "/actuator/health")}
     *
     * @return list of Ant-style path patterns
     */
    protected abstract List<String> getPublicPaths();

    /**
     * Extracts granted authorities from the JWT claims.
     *
     * <p>For user-facing services, this typically reads a single {@code role} claim
     * and returns it as one {@link GrantedAuthority}. For admin services, this may
     * read a {@code roles} list claim and return multiple authorities.</p>
     *
     * @param claims the parsed JWT claims
     * @return collection of granted authorities
     */
    protected abstract Collection<? extends GrantedAuthority> extractAuthorities(Claims claims);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return getPublicPaths().stream().anyMatch(pattern -> matchPath(pattern, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (token == null) {
                sendUnauthorized(response, "Missing or invalid Authorization header");
                return;
            }

            Claims claims;
            try {
                claims = Jwts.parser()
                        .verifyWith(signingKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } catch (ExpiredJwtException e) {
                log.warn("[JwtAuth] Expired token for request: {}", request.getRequestURI());
                sendUnauthorized(response, "Token has expired");
                return;
            } catch (Exception e) {
                log.warn("[JwtAuth] Invalid token: {}", e.getMessage());
                sendUnauthorized(response, "Invalid token");
                return;
            }

            // Extract userId from claims
            Long userId = claims.get("userId", Long.class);
            if (userId == null) {
                // Fallback: try subject as userId
                String subject = claims.getSubject();
                if (subject != null) {
                    try {
                        userId = Long.parseLong(subject);
                    } catch (NumberFormatException e) {
                        sendUnauthorized(response, "Invalid userId in token");
                        return;
                    }
                } else {
                    sendUnauthorized(response, "No userId in token");
                    return;
                }
            }

            // Check Redis token blacklist
            if (isTokenBlacklisted(userId)) {
                log.info("[JwtAuth] Blacklisted token for userId={}", userId);
                sendUnauthorized(response, "Token has been revoked");
                return;
            }

            // Extract authorities and set SecurityContext
            Collection<? extends GrantedAuthority> authorities = extractAuthorities(claims);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Set UserContext for downstream use
            String role = authorities.isEmpty() ? null :
                    authorities.iterator().next().getAuthority();
            UserContextHolder.set(UserContext.builder()
                    .userId(userId)
                    .role(role)
                    .build());

            filterChain.doFilter(request, response);

        } finally {
            UserContextHolder.clear();
            SecurityContextHolder.clearContext();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    private boolean isTokenBlacklisted(Long userId) {
        if (redisTemplate == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_KEY_PREFIX + userId));
        } catch (Exception e) {
            log.warn("[JwtAuth] Redis blacklist check failed for userId={}: {}", userId, e.getMessage());
            // Fail-open: if Redis is unavailable, allow the request
            return false;
        }
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"code\":\"UNAUTHORIZED\",\"message\":\"" + message + "\"}"
        );
    }

    /**
     * Simple path matching supporting Ant-style {@code **} and {@code *} wildcards.
     */
    private boolean matchPath(String pattern, String path) {
        // Convert Ant-style pattern to regex
        String regex = pattern
                .replace(".", "\\.")
                .replace("**", "@@DOUBLESTAR@@")
                .replace("*", "[^/]*")
                .replace("@@DOUBLESTAR@@", ".*");
        return path.matches(regex);
    }
}
