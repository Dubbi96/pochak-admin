package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

/**
 * Aggregated partner "me" endpoints.
 * Returns partner's own venues, products, and dashboard stats.
 */
@RestController
@RequestMapping("/api/v1/partners/me")
@RequiredArgsConstructor
public class PartnerMeController {

    private final RestClient operationClient;
    private final RestClient commerceClient;

    /**
     * 파트너 본인 시설 목록
     * GET /api/v1/partners/me/venues
     */
    @GetMapping("/venues")
    public String getMyVenues(@RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return operationClient.get()
                .uri(uriBuilder -> uriBuilder.path("/venues")
                        .queryParam("ownerId", userId)
                        .build())
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    /**
     * 파트너 본인 상품 목록 (전체 시설 통합)
     * GET /api/v1/partners/me/products
     * - 소유 시설 조회 후 각 시설의 상품을 집계
     */
    @GetMapping("/products")
    public String getMyProducts(@RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return operationClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/v1/venues/products/owner")
                        .queryParam("ownerId", userId)
                        .build())
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .body(String.class);
    }

    /**
     * 파트너 대시보드 통계
     * GET /api/v1/partners/me/dashboard-stats
     */
    @GetMapping("/dashboard-stats")
    public String getDashboardStats(@RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        throw new IllegalStateException("Partner dashboard stats API is not implemented in downstream operation-service.");
    }
}
