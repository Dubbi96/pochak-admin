package com.pochak.operation.partner.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PartnerReservationStatsResponse {

    private final long totalActiveReservations;
    private final long pendingCount;
    private final long confirmedCount;
    private final long completedCount;
}
