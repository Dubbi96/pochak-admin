package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/partner/analytics")
@RequiredArgsConstructor
public class PartnerAnalyticsController {

    @GetMapping("/revenue")
    public String getRevenue(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        throw new IllegalStateException("Partner revenue analytics API is not implemented in downstream services.");
    }

    @GetMapping("/reservations/stats")
    public String getReservationStats(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestParam(required = false) Long venueId) {
        throw new IllegalStateException("Partner reservation analytics API is not implemented in downstream services.");
    }
}
