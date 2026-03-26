package com.pochak.commerce.purchase.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.entity.ProductType;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Entity
@Table(name = "purchases", schema = "commerce")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Purchase {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "pg_type", nullable = false)
    private PgType pgType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PurchaseStatus status = PurchaseStatus.PENDING;

    @Column(name = "pg_transaction_id")
    private String pgTransactionId;

    @Column(name = "receipt_data", columnDefinition = "TEXT")
    private String receiptData;

    // --- Product snapshot fields (captured at purchase time) ---

    @Column(name = "product_name", length = 200)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", length = 30)
    private ProductType productType;

    @Column(name = "product_price_krw", precision = 12, scale = 2)
    private BigDecimal productPriceKrw;

    @Column(name = "product_price_point")
    private Integer productPricePoint;

    @Column(name = "product_duration_days")
    private Integer productDurationDays;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_snapshot", columnDefinition = "jsonb")
    private String productSnapshot;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void complete(String pgTransactionId) {
        this.status = PurchaseStatus.COMPLETED;
        this.pgTransactionId = pgTransactionId;
    }

    public void cancel() {
        this.status = PurchaseStatus.CANCELLED;
    }

    public void refund() {
        this.status = PurchaseStatus.REFUNDED;
    }

    /**
     * Captures a point-in-time snapshot of the product at purchase time.
     * This ensures refund calculations, receipt display, and audit trails
     * remain accurate even if the product is later modified.
     */
    public void snapshotProduct(Product product) {
        this.productName = product.getName();
        this.productType = product.getProductType();
        this.productPriceKrw = product.getPriceKrw();
        this.productPricePoint = product.getPricePoint();
        this.productDurationDays = product.getDurationDays();
        this.productSnapshot = toJson(product);
    }

    private String toJson(Product product) {
        try {
            return OBJECT_MAPPER.writeValueAsString(new ProductSnapshotData(product));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize product snapshot for product id={}", product.getId(), e);
            return null;
        }
    }

    /**
     * Inner record used to control which product fields are serialized into the JSON snapshot.
     */
    @Getter
    @AllArgsConstructor
    private static class ProductSnapshotData {
        private final Long id;
        private final String name;
        private final String productType;
        private final BigDecimal priceKrw;
        private final Integer pricePoint;
        private final Integer durationDays;
        private final String referenceType;
        private final Long referenceId;
        private final Boolean isActive;

        ProductSnapshotData(Product product) {
            this.id = product.getId();
            this.name = product.getName();
            this.productType = product.getProductType() != null ? product.getProductType().name() : null;
            this.priceKrw = product.getPriceKrw();
            this.pricePoint = product.getPricePoint();
            this.durationDays = product.getDurationDays();
            this.referenceType = product.getReferenceType();
            this.referenceId = product.getReferenceId();
            this.isActive = product.getIsActive();
        }
    }
}
