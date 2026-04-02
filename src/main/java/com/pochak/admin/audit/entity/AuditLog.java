package com.pochak.admin.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", schema = "admin")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_user_id")
    private Long adminUserId;

    @Column(nullable = false)
    private String action;

    @Column(name = "target_type")
    private String targetType;

    @Column(name = "target_id")
    private String targetId;

    /**
     * SEC-007: Changed from TEXT to JSONB for structured audit detail storage.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String detail;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    /**
     * SEC-007: SHA-256 hash of (action + targetType + targetId + detail + previousHash)
     * for tamper detection.  createdAt is excluded because it is set by @CreationTimestamp
     * after @PrePersist and its value is non-deterministic.
     */
    @Column(name = "hash", length = 64)
    private String hash;

    /**
     * SEC-007: Hash of the previous audit log entry, forming a hash chain for integrity verification.
     */
    @Column(name = "previous_hash", length = 64)
    private String previousHash;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Computes SHA-256 hash before persisting, creating a tamper-evident chain.
     */
    @PrePersist
    protected void computeHash() {
        String payload = String.join("|",
                nullSafe(action),
                nullSafe(targetType),
                nullSafe(targetId),
                nullSafe(detail),
                nullSafe(previousHash));
        this.hash = sha256(payload);
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private static String nullSafe(String value) {
        return value != null ? value : "";
    }
}
