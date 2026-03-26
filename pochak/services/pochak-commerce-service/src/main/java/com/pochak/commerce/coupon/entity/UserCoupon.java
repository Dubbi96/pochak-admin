package com.pochak.commerce.coupon.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_coupons",
        schema = "commerce",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "coupon_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UserCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CouponStatus status = CouponStatus.AVAILABLE;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Builder.Default
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt = LocalDateTime.now();

    public void use() {
        this.status = CouponStatus.USED;
        this.usedAt = LocalDateTime.now();
    }

    public void expire() {
        this.status = CouponStatus.EXPIRED;
    }
}
