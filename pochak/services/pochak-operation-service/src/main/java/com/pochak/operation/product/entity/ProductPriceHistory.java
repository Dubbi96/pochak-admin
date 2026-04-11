package com.pochak.operation.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_price_history", schema = "operation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class ProductPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "changed_by", nullable = false)
    private Long changedBy;

    @Column(name = "prev_price_per_hour", nullable = false)
    private Integer prevPricePerHour;

    @Column(name = "new_price_per_hour", nullable = false)
    private Integer newPricePerHour;

    @Column(name = "prev_price_per_day")
    private Integer prevPricePerDay;

    @Column(name = "new_price_per_day")
    private Integer newPricePerDay;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
