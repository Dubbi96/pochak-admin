package com.pochak.operation.partner.controller;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.operation.partner.dto.PartnerDashboardStatsResponse;
import com.pochak.operation.partner.dto.PartnerReservationStatsResponse;
import com.pochak.operation.partner.service.PartnerStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * Partner-scoped stats consumed by partner-bff (service-to-service, not public gateway).
 */
@RestController
@RequestMapping("/api/v1/partner")
@RequiredArgsConstructor
public class PartnerPortalController {

    private final PartnerStatsService partnerStatsService;

    @GetMapping("/reservation-stats")
    public ApiResponse<PartnerReservationStatsResponse> reservationStats(
            @RequestHeader("X-User-Id") Long headerUserId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long venueId) {
        if (userId != null && !headerUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "User id mismatch");
        }
        return ApiResponse.success(partnerStatsService.getReservationStats(headerUserId, venueId));
    }

    @GetMapping("/dashboard-stats")
    public ApiResponse<PartnerDashboardStatsResponse> dashboardStats(
            @RequestHeader("X-User-Id") Long headerUserId,
            @RequestParam(required = false) Long userId) {
        if (userId != null && !headerUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "User id mismatch");
        }
        return ApiResponse.success(partnerStatsService.getDashboardStats(headerUserId));
    }
}
