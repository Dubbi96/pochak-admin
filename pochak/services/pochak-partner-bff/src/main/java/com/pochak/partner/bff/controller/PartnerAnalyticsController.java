package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner/analytics")
@RequiredArgsConstructor
public class PartnerAnalyticsController {

    private final RestClient commerceClient;
    private final RestClient operationClient;

    @GetMapping("/revenue")
    public String getRevenue(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return commerceClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/v1/partner/revenue")
                        .queryParam("userId", userId)
                        .queryParamIfPresent("from", java.util.Optional.ofNullable(from))
                        .queryParamIfPresent("to", java.util.Optional.ofNullable(to))
                        .build())
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    @GetMapping("/reservations/stats")
    public String getReservationStats(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestParam(required = false) Long venueId) {
        return operationClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/v1/partner/reservation-stats")
                        .queryParam("userId", userId)
                        .queryParamIfPresent("venueId", java.util.Optional.ofNullable(venueId))
                        .build())
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }
}
