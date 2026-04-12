package com.pochak.commerce.settlement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "partner_balances", schema = "commerce")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PartnerBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "partner_id", nullable = false, unique = true)
    private Long partnerId;

    @Column(name = "total_revenue", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "settled_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal settledAmount = BigDecimal.ZERO;

    @Column(name = "pending_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal pendingAmount = BigDecimal.ZERO;

    @Column(length = 3, nullable = false)
    @Builder.Default
    private String currency = "KRW";

    @Column(name = "last_settled_at")
    private LocalDateTime lastSettledAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
