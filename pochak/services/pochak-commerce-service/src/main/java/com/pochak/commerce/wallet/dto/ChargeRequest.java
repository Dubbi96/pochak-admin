package com.pochak.commerce.wallet.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargeRequest {

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    @Max(value = 10_000_000, message = "Amount must not exceed 10,000,000")
    private Integer amount;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
