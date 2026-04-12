package com.pochak.commerce.partner.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Partner-facing revenue summary (aggregated in commerce domain).
 * Amounts are in the smallest currency unit or major unit per product policy; currently KRW totals.
 */
@Getter
@Builder
public class PartnerRevenueResponse {

    private final String currency;
    private final BigDecimal totalAmount;
    private final String from;
    private final String to;
    private final String note;
}
