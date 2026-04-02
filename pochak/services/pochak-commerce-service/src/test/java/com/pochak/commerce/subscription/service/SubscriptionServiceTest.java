package com.pochak.commerce.subscription.service;

import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.entitlement.entity.Entitlement;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.repository.EntitlementRepository;
import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.product.service.ProductService;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import com.pochak.commerce.purchase.repository.PurchaseRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @InjectMocks
    private SubscriptionService subscriptionService;

    @Mock
    private EntitlementRepository entitlementRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private ProductService productService;

    @Test
    @DisplayName("Should return active subscription for user")
    void testGetActiveSubscription() {
        Long userId = 1L;
        Entitlement entitlement = Entitlement.builder()
                .id(10L)
                .userId(userId)
                .purchaseId(5L)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .startsAt(LocalDateTime.now().minusDays(10))
                .expiresAt(LocalDateTime.now().plusDays(20))
                .isActive(true)
                .build();

        given(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any()))
                .willReturn(List.of(entitlement));

        EntitlementResponse response = subscriptionService.getActiveSubscription(userId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getEntitlementType()).isEqualTo(EntitlementType.SUBSCRIPTION);
    }

    @Test
    @DisplayName("Should return null when no active subscription")
    void testGetActiveSubscription_none() {
        Long userId = 1L;
        given(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any()))
                .willReturn(List.of());

        EntitlementResponse response = subscriptionService.getActiveSubscription(userId);

        assertThat(response).isNull();
    }

    @Test
    @DisplayName("Should cancel active subscription")
    void testCancelSubscription() {
        Long userId = 1L;
        Entitlement entitlement = Entitlement.builder()
                .id(10L)
                .userId(userId)
                .purchaseId(5L)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .startsAt(LocalDateTime.now().minusDays(10))
                .expiresAt(LocalDateTime.now().plusDays(20))
                .isActive(true)
                .build();

        given(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any()))
                .willReturn(List.of(entitlement));

        subscriptionService.cancelSubscription(userId);

        assertThat(entitlement.getIsActive()).isFalse();
    }

    @Test
    @DisplayName("Should throw when cancelling non-existent subscription")
    void testCancelSubscription_noSubscription() {
        Long userId = 1L;
        given(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any()))
                .willReturn(List.of());

        assertThatThrownBy(() -> subscriptionService.cancelSubscription(userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No active subscription");
    }

    @Test
    @DisplayName("Should renew subscription by creating new entitlement")
    void testRenewSubscription() {
        Long userId = 1L;
        Long productId = 20L;

        Entitlement currentEntitlement = Entitlement.builder()
                .id(10L)
                .userId(userId)
                .purchaseId(5L)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .startsAt(LocalDateTime.now().minusDays(25))
                .expiresAt(LocalDateTime.now().plusDays(5))
                .isActive(true)
                .build();

        Product product = Product.builder()
                .id(productId)
                .name("Monthly Subscription")
                .productType(ProductType.SUBSCRIPTION)
                .priceKrw(new BigDecimal("9900"))
                .durationDays(30)
                .isActive(true)
                .build();

        Purchase purchase = Purchase.builder()
                .id(5L)
                .userId(userId)
                .productId(productId)
                .build();

        Entitlement newEntitlement = Entitlement.builder()
                .id(11L)
                .userId(userId)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .startsAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .build();

        given(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any()))
                .willReturn(List.of(currentEntitlement));
        given(purchaseRepository.findById(5L)).willReturn(Optional.of(purchase));
        given(productService.findProductById(productId)).willReturn(product);
        given(entitlementRepository.save(any(Entitlement.class))).willReturn(newEntitlement);

        EntitlementResponse response = subscriptionService.renewSubscription(userId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(11L);
        // Old entitlement should be revoked
        assertThat(currentEntitlement.getIsActive()).isFalse();
        verify(entitlementRepository).save(any(Entitlement.class));
    }

    @Test
    @DisplayName("Should throw when renewing without active subscription")
    void testRenewSubscription_noSubscription() {
        Long userId = 1L;
        given(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any()))
                .willReturn(List.of());

        assertThatThrownBy(() -> subscriptionService.renewSubscription(userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No active subscription");
    }
}
