package com.pochak.identity.guardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentLimitCheckDto {

    private Long minorId;
    private Integer requestedAmount;
    private Integer monthlyPaymentLimit;
    private boolean allowed;
}
