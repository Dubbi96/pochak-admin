package com.pochak.identity.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    public static final String ISSUER = "pochak-identity";
    public static final String AUDIENCE = "pochak-api";
    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";
    public static final String TOKEN_TYPE_SIGNUP = "signup";
    public static final String CLAIM_TOKEN_TYPE = "typ";

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
                .id(UUID.randomUUID().toString())
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
                .subject(String.valueOf(userId))
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .requireIssuer(ISSUER)
                .requireAudience(AUDIENCE)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Claims parseAccessToken(String token) {
        Claims claims = parseToken(token);
        String typ = claims.get(CLAIM_TOKEN_TYPE, String.class);
        if (!TOKEN_TYPE_ACCESS.equals(typ)) {
            throw new RuntimeException("Expected access token but got: " + typ);
        }
        return claims;
    }

    public Claims parseRefreshToken(String token) {
        Claims claims = parseToken(token);
        String typ = claims.get(CLAIM_TOKEN_TYPE, String.class);
        if (!TOKEN_TYPE_REFRESH.equals(typ)) {
            throw new RuntimeException("Expected refresh token but got: " + typ);
        }
        return claims;
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

    public String getJtiFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getId();
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public String generateSignupToken(String provider, String providerId, String email,
                                      String name, String profileImageUrl) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 1800000);

        var builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
                .subject("signup")
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_SIGNUP)
                .claim("provider", provider)
                .claim("providerId", providerId)
                .claim("email", email);
        if (name != null) builder.claim("name", name);
        if (profileImageUrl != null) builder.claim("profileImageUrl", profileImageUrl);

        return builder
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseSignupToken(String token) {
        Claims claims = parseToken(token);
        if (!"signup".equals(claims.getSubject())) {
            throw new RuntimeException("Invalid signup token");
        }
        return claims;
    }
}
