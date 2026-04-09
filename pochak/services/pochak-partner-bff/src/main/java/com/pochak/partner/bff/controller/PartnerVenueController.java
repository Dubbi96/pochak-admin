package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner/venues")
@RequiredArgsConstructor
public class PartnerVenueController {

    private final RestClient operationClient;

    /**
     * 시설 운영시간 및 휴무일 일괄 설정 (POC-80)
     * body: { timeSlots: [...], closedDays: [...] }
     */
    @PutMapping("/{venueId}/schedule")
    public String updateVenueSchedule(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long venueId,
            @RequestBody String body) {
        return operationClient.put()
                .uri("/api/v1/venues/{venueId}/schedule", venueId)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    /**
     * 시설 운영시간 조회 (POC-80)
     */
    @GetMapping("/{venueId}/schedule")
    public String getVenueSchedule(@PathVariable Long venueId) {
        return operationClient.get()
                .uri("/api/v1/venues/{venueId}/schedule", venueId)
                .retrieve()
                .body(String.class);
    }
}
