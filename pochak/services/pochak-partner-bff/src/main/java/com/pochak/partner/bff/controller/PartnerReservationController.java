package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner/reservations")
@RequiredArgsConstructor
public class PartnerReservationController {

    private final RestClient operationClient;

    @GetMapping
    public String getReservations(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return operationClient.get()
                .uri(uriBuilder -> uriBuilder.path("/reservations")
                        .queryParam("reservedByUserId", userId)
                        .queryParamIfPresent("venueId", java.util.Optional.ofNullable(venueId))
                        .queryParamIfPresent("status", java.util.Optional.ofNullable(status))
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build())
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    @PutMapping("/{id}/approve")
    public String approveReservation(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long id) {
        String body = "{\"status\":\"PARTNER_APPROVED\"}";
        return operationClient.put()
                .uri("/reservations/{id}/status", id)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    @PutMapping("/{id}/reject")
    public String rejectReservation(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long id) {
        String body = "{\"status\":\"CANCELLED\"}";
        return operationClient.put()
                .uri("/reservations/{id}/status", id)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }
}
