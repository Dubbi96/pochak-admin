package com.pochak.bo.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.bo.bff.client.AdminServiceClient;
import com.pochak.bo.bff.client.CommerceServiceClient;
import com.pochak.bo.bff.client.ContentServiceClient;
import com.pochak.bo.bff.client.IdentityServiceClient;
import com.pochak.bo.bff.dto.BoDashboardResponse;
import com.pochak.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class BoDashboardController {

    private final AdminServiceClient adminClient;
    private final IdentityServiceClient identityClient;
    private final CommerceServiceClient commerceClient;
    private final ContentServiceClient contentClient;

    @GetMapping("/summary")
    public ApiResponse<BoDashboardResponse> getDashboardSummary() {
        log.debug("Fetching BO dashboard summary");

        JsonNode analytics = adminClient.getDashboardAnalytics().orElse(null);
        JsonNode memberStats = identityClient.getMemberStats().orElse(null);
        JsonNode revenueStats = safeCall(() -> commerceClient.getRevenueStats());
        JsonNode pendingRefunds = safeCall(() -> commerceClient.listRefunds(Map.of("status", "PENDING", "size", "5")));
        JsonNode pendingReports = adminClient.getPendingReports().orElse(null);
        JsonNode recentAuditLogs = adminClient.getAuditLogs(Map.of("size", "10")).orElse(null);

        return ApiResponse.success(BoDashboardResponse.builder()
                .analytics(analytics)
                .memberStats(memberStats)
                .revenueStats(revenueStats)
                .pendingRefunds(pendingRefunds)
                .pendingReports(pendingReports)
                .recentAuditLogs(recentAuditLogs)
                .build());
    }

    @GetMapping("/audit-logs")
    public ApiResponse<JsonNode> getAuditLogs(@RequestParam Map<String, String> params) {
        return ApiResponse.success(adminClient.getAuditLogs(params).orElse(null));
    }

    private JsonNode safeCall(java.util.function.Supplier<JsonNode> supplier) {
        try {
            return supplier.get();
        } catch (Exception e) {
            log.warn("Dashboard aggregate call failed: {}", e.getMessage());
            return null;
        }
    }
}
