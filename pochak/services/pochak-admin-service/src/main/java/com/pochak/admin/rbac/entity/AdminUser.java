package com.pochak.admin.rbac.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_users", schema = "admin")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", nullable = false, unique = true)
    private String loginId;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_blocked", nullable = false)
    private Boolean isBlocked = false;

    @Builder.Default
    @Column(name = "fail_count", nullable = false)
    private Integer failCount = 0;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void incrementFailCount() {
        this.failCount = (this.failCount == null ? 0 : this.failCount) + 1;
        if (this.failCount >= 5) {
            this.isBlocked = true;
        }
    }

    public void resetFailCount() {
        this.failCount = 0;
    }

    public void recordLoginSuccess() {
        this.failCount = 0;
        this.lastLoginAt = LocalDateTime.now();
    }

    public void block() {
        this.isBlocked = true;
    }

    public void unblock() {
        this.isBlocked = false;
        this.failCount = 0;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void updateInfo(String name, String email, String phone) {
        if (name != null) this.name = name;
        if (email != null) this.email = email;
        if (phone != null) this.phone = phone;
    }

    public void updatePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
