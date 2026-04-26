package com.pochak.commerce.partner.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.partner.dto.PartnerRevenueResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Internal API for partner BFF: commerce-scoped partner revenue summary.
 * Full aggregation with purchases/refunds can replace the stub totals later.
 */
@RestController
@RequestMapping("/api/v1/partner")
public class PartnerRevenueController {

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<PartnerRevenueResponse>> getRevenue(
            @RequestHeader("X-User-Id") Long headerUserId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        if (userId != null && !headerUserId.equals(userId)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.<PartnerRevenueResponse>error("User id mismatch"));
        }
        PartnerRevenueResponse body = PartnerRevenueResponse.builder()
                .currency("KRW")
                .totalAmount(BigDecimal.ZERO)
                .from(from)
                .to(to)
                .note("Revenue aggregation not yet wired; returning zero placeholder.")
                .build();
        return ResponseEntity.ok(ApiResponse.ok(body));
    }
}
