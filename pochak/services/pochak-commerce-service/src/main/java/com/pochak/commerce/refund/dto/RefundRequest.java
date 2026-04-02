package com.pochak.commerce.refund.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {

    @NotNull(message = "Purchase ID is required")
    private Long purchaseId;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
}
