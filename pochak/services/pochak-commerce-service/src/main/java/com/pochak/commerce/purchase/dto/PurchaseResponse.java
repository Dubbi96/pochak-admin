package com.pochak.commerce.purchase.dto;

import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.purchase.entity.PgType;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PurchaseResponse {

    private Long id;
    private Long userId;
    private Long productId;
    private PgType pgType;
    private BigDecimal amount;
    private PurchaseStatus status;
    private String pgTransactionId;
    private LocalDateTime createdAt;

    // Product snapshot fields
    private String productName;
    private ProductType productType;
    private BigDecimal productPriceKrw;
    private Integer productPricePoint;
    private Integer productDurationDays;

    public static PurchaseResponse from(Purchase purchase) {
        return PurchaseResponse.builder()
                .id(purchase.getId())
                .userId(purchase.getUserId())
                .productId(purchase.getProductId())
                .pgType(purchase.getPgType())
                .amount(purchase.getAmount())
                .status(purchase.getStatus())
                .pgTransactionId(purchase.getPgTransactionId())
                .createdAt(purchase.getCreatedAt())
                .productName(purchase.getProductName())
                .productType(purchase.getProductType())
                .productPriceKrw(purchase.getProductPriceKrw())
                .productPricePoint(purchase.getProductPricePoint())
                .productDurationDays(purchase.getProductDurationDays())
                .build();
    }
}
