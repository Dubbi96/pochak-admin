package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner/settlements")
@RequiredArgsConstructor
public class PartnerSettlementController {

    private final RestClient commerceClient;

    @GetMapping("/balance")
    public String getBalance(@RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return commerceClient.get()
                .uri("/api/v1/partner/balances")
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    @GetMapping
    public String getSettlements(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return commerceClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/v1/partner/settlements")
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build())
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    @PatchMapping("/{settlementId}/confirm")
    public String confirmSettlement(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long settlementId) {
        return commerceClient.patch()
                .uri("/api/v1/partner/settlements/{id}/confirm", settlementId)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }
}
