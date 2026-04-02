package com.pochak.commerce.subscription.service;

import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.entitlement.entity.Entitlement;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.repository.EntitlementRepository;
import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.service.ProductService;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final EntitlementRepository entitlementRepository;
    private final PurchaseRepository purchaseRepository;
    private final ProductService productService;

    public EntitlementResponse getActiveSubscription(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Entitlement> subscriptions = entitlementRepository
                .findActiveEntitlementsByType(userId, EntitlementType.SUBSCRIPTION, now);
        if (subscriptions.isEmpty()) {
            return null;
        }
        return EntitlementResponse.from(subscriptions.getFirst());
    }

    @Transactional
    public void cancelSubscription(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Entitlement> subscriptions = entitlementRepository
                .findActiveEntitlementsByType(userId, EntitlementType.SUBSCRIPTION, now);
        if (subscriptions.isEmpty()) {
            throw new IllegalStateException("No active subscription found for user: " + userId);
        }
        subscriptions.forEach(Entitlement::revoke);
    }

    @Transactional
    public EntitlementResponse renewSubscription(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Entitlement> subscriptions = entitlementRepository
                .findActiveEntitlementsByType(userId, EntitlementType.SUBSCRIPTION, now);
        if (subscriptions.isEmpty()) {
            throw new IllegalStateException("No active subscription to renew for user: " + userId);
        }

        Entitlement current = subscriptions.getFirst();

        // Find the original product via the purchase
        Purchase originalPurchase = purchaseRepository.findById(current.getPurchaseId())
                .orElseThrow(() -> new IllegalStateException("Original purchase not found: " + current.getPurchaseId()));
        Product product = productService.findProductById(originalPurchase.getProductId());

        // Revoke current and create new entitlement starting from now
        current.revoke();

        int durationDays = product.getDurationDays() != null ? product.getDurationDays() : 30;
        Entitlement renewed = Entitlement.builder()
                .userId(userId)
                .purchaseId(current.getPurchaseId())
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .scopeType(current.getScopeType())
                .scopeId(current.getScopeId())
                .startsAt(now)
                .expiresAt(now.plusDays(durationDays))
                .build();

        Entitlement saved = entitlementRepository.save(renewed);
        return EntitlementResponse.from(saved);
    }
}
