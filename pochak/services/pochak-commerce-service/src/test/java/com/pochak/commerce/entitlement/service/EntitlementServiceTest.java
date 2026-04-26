package com.pochak.commerce.entitlement.service;

import com.pochak.commerce.entitlement.dto.EntitlementCheckResponse;
import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.entitlement.entity.Entitlement;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.repository.EntitlementRepository;
import com.pochak.commerce.event.EntitlementExpiredEvent;
import com.pochak.common.event.EventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EntitlementServiceTest {

    @InjectMocks
    private EntitlementService entitlementService;

    @Mock
    private EntitlementRepository entitlementRepository;

    @Mock
    private EventPublisher eventPublisher;

    @Test
    @DisplayName("Should return hasAccess=true when user has active subscription")
    void testCheckAccess_hasSubscription() {
        Long userId = 1L;
        Entitlement entitlement = Entitlement.builder()
                .id(1L)
                .userId(userId)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .startsAt(LocalDateTime.now().minusDays(10))
                .expiresAt(LocalDateTime.now().plusDays(20))
                .isActive(true)
                .build();

        when(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any(LocalDateTime.class)))
                .thenReturn(List.of(entitlement));

        EntitlementCheckResponse response = entitlementService.checkEntitlement(
                userId, EntitlementType.SUBSCRIPTION, null, null);

        assertTrue(response.isHasAccess());
        assertTrue(response.isEntitled());
        assertEquals("SUBSCRIPTION", response.getReason());
        assertEquals(EntitlementType.SUBSCRIPTION, response.getEntitlementType());
    }

    @Test
    @DisplayName("Should return hasAccess=false when user has no entitlements")
    void testCheckAccess_noAccess() {
        Long userId = 1L;

        when(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.SUBSCRIPTION), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        EntitlementCheckResponse response = entitlementService.checkEntitlement(
                userId, EntitlementType.SUBSCRIPTION, null, null);

        assertFalse(response.isHasAccess());
        assertFalse(response.isEntitled());
        assertEquals("NO_ENTITLEMENT", response.getReason());
    }

    @Test
    @DisplayName("Should filter entitlements by scope")
    void testCheckAccess_withScope() {
        Long userId = 1L;
        Entitlement matchEntitlement = Entitlement.builder()
                .id(1L)
                .userId(userId)
                .entitlementType(EntitlementType.MATCH_TICKET)
                .scopeType("MATCH")
                .scopeId(100L)
                .startsAt(LocalDateTime.now().minusDays(1))
                .expiresAt(LocalDateTime.now().plusDays(1))
                .isActive(true)
                .build();

        when(entitlementRepository.findActiveEntitlementsByType(eq(userId), eq(EntitlementType.MATCH_TICKET), any(LocalDateTime.class)))
                .thenReturn(List.of(matchEntitlement));

        EntitlementCheckResponse response = entitlementService.checkEntitlement(
                userId, EntitlementType.MATCH_TICKET, "MATCH", 100L);

        assertTrue(response.isHasAccess());
        assertEquals("MATCH_TICKET", response.getReason());
        assertEquals("MATCH", response.getScopeType());
        assertEquals(100L, response.getScopeId());
    }

    @Test
    @DisplayName("Should return active entitlements list")
    void testGetActiveEntitlements() {
        Long userId = 1L;
        Entitlement entitlement = Entitlement.builder()
                .id(1L)
                .userId(userId)
                .entitlementType(EntitlementType.SUBSCRIPTION)
                .startsAt(LocalDateTime.now().minusDays(5))
                .expiresAt(LocalDateTime.now().plusDays(25))
                .isActive(true)
                .build();

        when(entitlementRepository.findActiveEntitlements(eq(userId), any(LocalDateTime.class)))
                .thenReturn(List.of(entitlement));

        List<EntitlementResponse> responses = entitlementService.getActiveEntitlements(userId);

        assertEquals(1, responses.size());
        assertEquals(EntitlementType.SUBSCRIPTION, responses.getFirst().getEntitlementType());
    }

    @Test
    @DisplayName("Should grant entitlement with duration")
    void testGrantEntitlement() {
        Long userId = 1L;
        Long purchaseId = 10L;

        when(entitlementRepository.save(any(Entitlement.class))).thenAnswer(i -> {
            Entitlement e = i.getArgument(0);
            return Entitlement.builder()
                    .id(1L)
                    .userId(e.getUserId())
                    .purchaseId(e.getPurchaseId())
                    .entitlementType(e.getEntitlementType())
                    .scopeType(e.getScopeType())
                    .scopeId(e.getScopeId())
                    .startsAt(e.getStartsAt())
                    .expiresAt(e.getExpiresAt())
                    .isActive(true)
                    .build();
        });

        Entitlement result = entitlementService.grantEntitlement(
                userId, purchaseId, EntitlementType.SEASON_PASS, "LEAGUE", 5L, 90);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(purchaseId, result.getPurchaseId());
        assertEquals(EntitlementType.SEASON_PASS, result.getEntitlementType());
        assertNotNull(result.getExpiresAt());
    }

    @Test
    @DisplayName("Should publish EntitlementExpiredEvent for each revoked entitlement")
    void testRevokeByPurchaseId_publishesEvents() {
        Long purchaseId = 10L;
        Entitlement entitlement1 = Entitlement.builder()
                .id(1L)
                .userId(100L)
                .purchaseId(purchaseId)
                .entitlementType(EntitlementType.MATCH_TICKET)
                .scopeType("MATCH")
                .scopeId(200L)
                .startsAt(LocalDateTime.now().minusDays(1))
                .expiresAt(LocalDateTime.now().plusDays(1))
                .isActive(true)
                .build();
        Entitlement entitlement2 = Entitlement.builder()
                .id(2L)
                .userId(100L)
                .purchaseId(purchaseId)
                .entitlementType(EntitlementType.SEASON_PASS)
                .scopeType(null)
                .scopeId(null)
                .startsAt(LocalDateTime.now().minusDays(5))
                .expiresAt(LocalDateTime.now().plusDays(25))
                .isActive(true)
                .build();

        when(entitlementRepository.findByPurchaseId(purchaseId))
                .thenReturn(List.of(entitlement1, entitlement2));

        entitlementService.revokeByPurchaseId(purchaseId);

        // Both entitlements revoked
        assertFalse(entitlement1.getIsActive());
        assertFalse(entitlement2.getIsActive());

        // EntitlementExpiredEvent published for each
        ArgumentCaptor<EntitlementExpiredEvent> captor =
                ArgumentCaptor.forClass(EntitlementExpiredEvent.class);
        verify(eventPublisher, times(2)).publish(captor.capture());

        List<EntitlementExpiredEvent> events = captor.getAllValues();
        assertEquals(1L, events.get(0).getEntitlementId());
        assertEquals("MATCH_TICKET", events.get(0).getEntitlementType());
        assertEquals("MATCH", events.get(0).getScopeType());
        assertEquals(200L, events.get(0).getScopeId());

        assertEquals(2L, events.get(1).getEntitlementId());
        assertEquals("SEASON_PASS", events.get(1).getEntitlementType());
        assertNull(events.get(1).getScopeType());
    }

    @Test
    @DisplayName("Should not publish events when no entitlements found for purchaseId")
    void testRevokeByPurchaseId_noEntitlements() {
        Long purchaseId = 99L;
        when(entitlementRepository.findByPurchaseId(purchaseId)).thenReturn(Collections.emptyList());

        entitlementService.revokeByPurchaseId(purchaseId);

        verifyNoInteractions(eventPublisher);
    }
}
