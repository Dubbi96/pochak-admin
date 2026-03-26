package com.pochak.commerce.coupon.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", schema = "commerce")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 30)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private Integer discountValue;

    @Builder.Default
    @Column(name = "min_purchase_amount")
    private Integer minPurchaseAmount = 0;

    @Column(name = "max_discount_amount")
    private Integer maxDiscountAmount;

    @Column(name = "max_usage_count")
    private Integer maxUsageCount;

    @Builder.Default
    @Column(name = "current_usage_count")
    private Integer currentUsageCount = 0;

    @Builder.Default
    @Column(name = "per_user_limit")
    private Integer perUserLimit = 1;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(endDate);
    }

    public boolean isUsable() {
        return isActive
                && !isExpired()
                && LocalDateTime.now().isAfter(startDate)
                && (maxUsageCount == null || currentUsageCount < maxUsageCount);
    }

    public void incrementUsageCount() {
        this.currentUsageCount++;
    }

    public String getDiscountLabel() {
        return switch (discountType) {
            case PERCENTAGE -> discountValue + "%";
            case FIXED_AMOUNT -> String.format("%,d원", discountValue);
            case BALL_GRANT -> String.format("%,d뽈", discountValue);
        };
    }
}
