package com.pochak.operation.partner.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PartnerDashboardStatsResponse {

    private final int venueCount;
    private final int productCount;
    private final long monthlyReservations;
    /** Placeholder until commerce revenue is aggregated for partners in-operation. */
    private final BigDecimal monthlyRevenue;
}
