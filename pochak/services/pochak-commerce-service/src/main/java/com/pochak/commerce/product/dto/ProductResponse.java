package com.pochak.commerce.product.dto;

import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.entity.ProductType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private ProductType productType;
    private BigDecimal priceKrw;
    private Integer pricePoint;
    private Integer durationDays;
    private String referenceType;
    private Long referenceId;
    private Boolean isActive;

    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .productType(product.getProductType())
                .priceKrw(product.getPriceKrw())
                .pricePoint(product.getPricePoint())
                .durationDays(product.getDurationDays())
                .referenceType(product.getReferenceType())
                .referenceId(product.getReferenceId())
                .isActive(product.getIsActive())
                .build();
    }
}
