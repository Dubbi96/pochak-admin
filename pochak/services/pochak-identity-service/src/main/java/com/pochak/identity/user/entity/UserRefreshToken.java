package com.pochak.identity.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Entity
@Table(name = "user_refresh_tokens", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserRefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "token_hash", length = 64)
    private String tokenHash;

    @Column(name = "token_family", length = 36)
    private String tokenFamily;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "reuse_detected", nullable = false)
    @Builder.Default
    private boolean reuseDetected = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "token", length = 500)
    private String token;

    public void updateToken(String rawToken, String family) {
        this.tokenHash = hashToken(rawToken);
        this.tokenFamily = family;
        this.reuseDetected = false;
        this.token = null;
    }

    @Deprecated
    public void updateToken(String rawToken) {
        this.token = rawToken;
    }

    public boolean matchesToken(String rawToken) {
        if (this.tokenHash != null) {
            return this.tokenHash.equals(hashToken(rawToken));
        }
        return this.token != null && this.token.equals(rawToken);
    }

    public void markReuseDetected() {
        this.reuseDetected = true;
    }

    public static String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
