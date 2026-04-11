package com.pochak.commerce.entitlement.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.entitlement.dto.EntitlementCheckResponse;
import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.service.EntitlementService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EntitlementControllerTest {

    @Mock
    private EntitlementService entitlementService;

    @InjectMocks
    private EntitlementController entitlementController;

    @Test
    @DisplayName("GET /entitlements - should return user entitlements (200)")
    void getEntitlements_success() {
        // given
        Long userId = 1L;
        EntitlementResponse entitlement = EntitlementResponse.builder()
                .id(1L)
                .userId(userId)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .isActive(true)
                .startsAt(LocalDateTime.now().minusDays(5))
                .expiresAt(LocalDateTime.now().plusDays(25))
                .build();
        given(entitlementService.getActiveEntitlements(userId)).willReturn(List.of(entitlement));

        // when
        ResponseEntity<ApiResponse<List<EntitlementResponse>>> result =
                entitlementController.getEntitlements(userId);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData()).hasSize(1);
        assertThat(result.getBody().getData().get(0).getIsActive()).isTrue();
    }

    @Test
    @DisplayName("GET /entitlements - should return empty list when no entitlements")
    void getEntitlements_empty() {
        // given
        Long userId = 99L;
        given(entitlementService.getActiveEntitlements(userId)).willReturn(List.of());

        // when
        ResponseEntity<ApiResponse<List<EntitlementResponse>>> result =
                entitlementController.getEntitlements(userId);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData()).isEmpty();
    }

    @Test
    @DisplayName("GET /entitlements/check - should check entitlement by type")
    void checkEntitlement_withType() {
        // given
        Long userId = 1L;
        EntitlementCheckResponse response = EntitlementCheckResponse.builder()
                .hasAccess(true)
                .entitled(true)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .build();
        given(entitlementService.checkEntitlement(userId, EntitlementType.SUBSCRIPTION, null, null))
                .willReturn(response);

        // when
        ResponseEntity<ApiResponse<EntitlementCheckResponse>> result =
                entitlementController.checkEntitlement(userId, EntitlementType.SUBSCRIPTION, null, null);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().isHasAccess()).isTrue();
        assertThat(result.getBody().getData().isEntitled()).isTrue();
        verify(entitlementService).checkEntitlement(userId, EntitlementType.SUBSCRIPTION, null, null);
    }

    @Test
    @DisplayName("GET /entitlements/check - should check access when type is null")
    void checkEntitlement_withoutType() {
        // given
        Long userId = 1L;
        EntitlementCheckResponse response = EntitlementCheckResponse.builder()
                .hasAccess(false)
                .entitled(false)
                .reason("No entitlement found")
                .build();
        given(entitlementService.checkAccess(userId, "COMPETITION", 5L)).willReturn(response);

        // when
        ResponseEntity<ApiResponse<EntitlementCheckResponse>> result =
                entitlementController.checkEntitlement(userId, null, "COMPETITION", 5L);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().isHasAccess()).isFalse();
        verify(entitlementService).checkAccess(userId, "COMPETITION", 5L);
    }
}
