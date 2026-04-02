package com.pochak.commerce.subscription.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EntitlementResponse>> getActiveSubscription(
            @RequestHeader("X-User-Id") Long userId) {
        EntitlementResponse response = subscriptionService.getActiveSubscription(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelSubscription(
            @RequestHeader("X-User-Id") Long userId) {
        subscriptionService.cancelSubscription(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Subscription cancelled"));
    }

    @PostMapping("/renew")
    public ResponseEntity<ApiResponse<EntitlementResponse>> renewSubscription(
            @RequestHeader("X-User-Id") Long userId) {
        EntitlementResponse response = subscriptionService.renewSubscription(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
