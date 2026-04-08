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

@Slf4j
public abstract class AbstractJwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String BLACKLIST_KEY_PREFIX = "token-blacklist:";
    private static final String JTI_BLACKLIST_KEY_PREFIX = "token-blacklist:jti:";
    private static final String EXPECTED_ISSUER = "pochak-identity";
    private static final String EXPECTED_AUDIENCE = "pochak-api";

    private final SecretKey signingKey;
    private final StringRedisTemplate redisTemplate;

    protected AbstractJwtAuthFilter(String jwtSecret, StringRedisTemplate redisTemplate) {
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.redisTemplate = redisTemplate;
    }

    protected abstract List<String> getPublicPaths();
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
                        .requireIssuer(EXPECTED_ISSUER)
                        .requireAudience(EXPECTED_AUDIENCE)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String tokenType = claims.get("typ", String.class);
                if (tokenType != null && !"access".equals(tokenType)) {
                    sendUnauthorized(response, "Invalid token type");
                    return;
                }
            } catch (ExpiredJwtException e) {
                sendUnauthorized(response, "Token has expired");
                return;
            } catch (Exception e) {
                sendUnauthorized(response, "Invalid token");
                return;
            }

            Long userId = claims.get("userId", Long.class);
            if (userId == null) {
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

            String jti = claims.getId();
            if (isTokenBlacklisted(jti, userId)) {
                sendUnauthorized(response, "Token has been revoked");
                return;
            }

            Collection<? extends GrantedAuthority> authorities = extractAuthorities(claims);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String role = authorities.isEmpty() ? null :
                    authorities.iterator().next().getAuthority();
            UserContextHolder.set(UserContext.builder().userId(userId).role(role).build());

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

    private boolean isTokenBlacklisted(String jti, Long userId) {
        if (redisTemplate == null) return false;
        try {
            if (jti != null && Boolean.TRUE.equals(redisTemplate.hasKey(JTI_BLACKLIST_KEY_PREFIX + jti))) {
                return true;
            }
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_KEY_PREFIX + userId));
        } catch (Exception e) {
            log.warn("[JwtAuth] Redis blacklist check failed: {}", e.getMessage());
            return false;
        }
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"code\":\"UNAUTHORIZED\",\"message\":\"" + message + "\"}");
    }

    private boolean matchPath(String pattern, String path) {
        String regex = pattern
                .replace(".", "\\.")
                .replace("**", "@@DOUBLESTAR@@")
                .replace("*", "[^/]*")
                .replace("@@DOUBLESTAR@@", ".*");
        return path.matches(regex);
    }
}
