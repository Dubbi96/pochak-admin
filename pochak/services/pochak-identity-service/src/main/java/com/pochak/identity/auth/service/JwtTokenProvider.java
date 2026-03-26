package com.pochak.identity.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${pochak.jwt.secret}") String secret,
            @Value("${pochak.jwt.access-expiration:1800000}") long accessTokenExpiration,
            @Value("${pochak.jwt.refresh-expiration:2592000000}") long refreshTokenExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(Long userId, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getRoleFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    /**
     * Generate a short-lived token carrying OAuth provider info for signup flow.
     * Valid for 30 minutes.
     */
    public String generateSignupToken(String provider, String providerId, String email,
                                      String name, String profileImageUrl) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 1800000); // 30 min

        var builder = Jwts.builder()
                .subject("signup")
                .claim("provider", provider)
                .claim("providerId", providerId)
                .claim("email", email);
        if (name != null) builder.claim("name", name);
        if (profileImageUrl != null) builder.claim("profileImageUrl", profileImageUrl);

        return builder
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Parse signup token and return claims.
     */
    public Claims parseSignupToken(String token) {
        Claims claims = parseToken(token);
        if (!"signup".equals(claims.getSubject())) {
            throw new RuntimeException("Invalid signup token");
        }
        return claims;
    }
}
