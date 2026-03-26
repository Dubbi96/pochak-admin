package com.pochak.commerce.product.dto;

import com.pochak.commerce.product.entity.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {

    @NotBlank
    private String name;

    @NotNull
    private ProductType productType;

    private BigDecimal priceKrw;

    private Integer pricePoint;

    private Integer durationDays;

    private String referenceType;

    private Long referenceId;
}
