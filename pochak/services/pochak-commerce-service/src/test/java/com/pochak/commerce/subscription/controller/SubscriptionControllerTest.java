package com.pochak.commerce.subscription.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.subscription.service.SubscriptionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SubscriptionControllerTest {

    @Mock
    private SubscriptionService subscriptionService;

    @InjectMocks
    private SubscriptionController subscriptionController;

    @Test
    @DisplayName("GET /subscriptions/me - should return active subscription (200)")
    void getActiveSubscription_success() {
        // given
        Long userId = 1L;
        EntitlementResponse response = EntitlementResponse.builder()
                .id(1L)
                .userId(userId)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .startsAt(LocalDateTime.now().minusDays(10))
                .expiresAt(LocalDateTime.now().plusDays(20))
                .isActive(true)
                .build();
        given(subscriptionService.getActiveSubscription(userId)).willReturn(response);

        // when
        ResponseEntity<ApiResponse<EntitlementResponse>> result =
                subscriptionController.getActiveSubscription(userId);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData().getUserId()).isEqualTo(userId);
        assertThat(result.getBody().getData().getIsActive()).isTrue();
    }

    @Test
    @DisplayName("GET /subscriptions/me - should propagate exception when no subscription")
    void getActiveSubscription_notFound() {
        // given
        Long userId = 99L;
        given(subscriptionService.getActiveSubscription(userId))
                .willThrow(new RuntimeException("No active subscription"));

        // when / then
        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class,
                () -> subscriptionController.getActiveSubscription(userId));
    }

    @Test
    @DisplayName("POST /subscriptions/cancel - should cancel subscription")
    void cancelSubscription_success() {
        // given
        Long userId = 1L;

        // when
        ResponseEntity<ApiResponse<Void>> result = subscriptionController.cancelSubscription(userId);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().isSuccess()).isTrue();
        verify(subscriptionService).cancelSubscription(userId);
    }

    @Test
    @DisplayName("POST /subscriptions/renew - should renew subscription")
    void renewSubscription_success() {
        // given
        Long userId = 1L;
        EntitlementResponse response = EntitlementResponse.builder()
                .id(2L)
                .userId(userId)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .isActive(true)
                .build();
        given(subscriptionService.renewSubscription(userId)).willReturn(response);

        // when
        ResponseEntity<ApiResponse<EntitlementResponse>> result =
                subscriptionController.renewSubscription(userId);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getId()).isEqualTo(2L);
    }
}
