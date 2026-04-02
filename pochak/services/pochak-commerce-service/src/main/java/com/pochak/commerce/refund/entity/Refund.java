package com.pochak.commerce.refund.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds", schema = "commerce")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "purchase_id", nullable = false)
    private Long purchaseId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "refund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RefundStatus status = RefundStatus.REQUESTED;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "admin_note")
    private String adminNote;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void approve(String adminNote) {
        if (this.status != RefundStatus.REQUESTED) {
            throw new IllegalStateException("Only REQUESTED refunds can be processed. Current status: " + this.status);
        }
        this.status = RefundStatus.APPROVED;
        this.processedAt = LocalDateTime.now();
        this.adminNote = adminNote;
    }

    public void reject(String adminNote) {
        if (this.status != RefundStatus.REQUESTED) {
            throw new IllegalStateException("Only REQUESTED refunds can be processed. Current status: " + this.status);
        }
        this.status = RefundStatus.REJECTED;
        this.processedAt = LocalDateTime.now();
        this.adminNote = adminNote;
    }

    public void complete() {
        this.status = RefundStatus.COMPLETED;
    }
}
