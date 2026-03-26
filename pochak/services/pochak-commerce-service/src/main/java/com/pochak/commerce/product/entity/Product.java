package com.pochak.commerce.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", schema = "commerce")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType productType;

    @Column(name = "price_krw", precision = 12, scale = 2)
    private BigDecimal priceKrw;

    @Column(name = "price_point")
    private Integer pricePoint;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void update(String name, ProductType productType, BigDecimal priceKrw,
                       Integer pricePoint, Integer durationDays, String referenceType, Long referenceId) {
        this.name = name;
        this.productType = productType;
        this.priceKrw = priceKrw;
        this.pricePoint = pricePoint;
        this.durationDays = durationDays;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
    }

    public void softDelete() {
        this.isActive = false;
    }
}
