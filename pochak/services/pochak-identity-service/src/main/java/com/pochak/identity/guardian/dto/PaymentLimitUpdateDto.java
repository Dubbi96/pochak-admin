package com.pochak.identity.guardian.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentLimitUpdateDto {

    @NotNull(message = "결제 한도는 필수입니다")
    @Min(value = 0, message = "결제 한도는 0 이상이어야 합니다")
    private Integer monthlyPaymentLimit;
}
