package com.pochak.commerce.purchase.dto;

import com.pochak.commerce.purchase.entity.PgType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class PurchaseRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "PG type is required")
    private PgType pgType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @Size(max = 5000, message = "Receipt data must not exceed 5000 characters")
    private String receiptData;
}
