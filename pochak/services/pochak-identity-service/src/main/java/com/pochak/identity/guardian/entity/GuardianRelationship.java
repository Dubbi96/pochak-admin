package com.pochak.identity.guardian.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "guardian_relationships", schema = "identity",
       uniqueConstraints = @UniqueConstraint(columnNames = {"guardian_id", "minor_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class GuardianRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guardian_id", nullable = false)
    private Long guardianId;

    @Column(name = "minor_id", nullable = false)
    private Long minorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GuardianStatus status = GuardianStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_method", nullable = false, length = 20)
    private ConsentMethod consentMethod;

    @Column(name = "consented_at")
    private LocalDateTime consentedAt;

    @Column(name = "monthly_payment_limit")
    @Builder.Default
    private Integer monthlyPaymentLimit = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void verify() {
        this.status = GuardianStatus.VERIFIED;
        this.consentedAt = LocalDateTime.now();
    }

    public void revoke() {
        this.status = GuardianStatus.REVOKED;
    }

    public void updatePaymentLimit(Integer limit) {
        this.monthlyPaymentLimit = limit;
    }

    public enum GuardianStatus {
        PENDING, VERIFIED, REVOKED
    }

    public enum ConsentMethod {
        PASS_AUTH, KAKAO_AUTH, SMS_AUTH, MANUAL
    }
}
