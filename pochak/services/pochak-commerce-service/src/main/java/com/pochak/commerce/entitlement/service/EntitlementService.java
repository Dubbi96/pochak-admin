package com.pochak.commerce.entitlement.service;

import com.pochak.commerce.entitlement.dto.EntitlementCheckResponse;
import com.pochak.commerce.entitlement.dto.EntitlementResponse;
import com.pochak.commerce.entitlement.entity.Entitlement;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.repository.EntitlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EntitlementService {

    private final EntitlementRepository entitlementRepository;

    public EntitlementCheckResponse checkEntitlement(Long userId, EntitlementType type, String scopeType, Long scopeId) {
        LocalDateTime now = LocalDateTime.now();
        List<Entitlement> entitlements = entitlementRepository.findActiveEntitlementsByType(userId, type, now);

        if (scopeType != null && scopeId != null) {
            entitlements = entitlements.stream()
                    .filter(e -> scopeType.equals(e.getScopeType()) && scopeId.equals(e.getScopeId()))
                    .toList();
        }

        if (entitlements.isEmpty()) {
            return EntitlementCheckResponse.builder()
                    .hasAccess(false)
                    .entitled(false)
                    .reason("NO_ENTITLEMENT")
                    .build();
        }

        Entitlement entitlement = entitlements.getFirst();
        String reason = entitlement.getEntitlementType().name();
        return EntitlementCheckResponse.builder()
                .hasAccess(true)
                .entitled(true)
                .reason(reason)
                .entitlementType(entitlement.getEntitlementType())
                .scopeType(entitlement.getScopeType())
                .scopeId(entitlement.getScopeId())
                .expiresAt(entitlement.getExpiresAt())
                .build();
    }

    public EntitlementCheckResponse checkAccess(Long userId, String scopeType, Long scopeId) {
        LocalDateTime now = LocalDateTime.now();
        List<Entitlement> entitlements = entitlementRepository.findActiveEntitlements(userId, now);

        if (scopeType != null && scopeId != null) {
            entitlements = entitlements.stream()
                    .filter(e -> scopeType.equals(e.getScopeType()) && scopeId.equals(e.getScopeId()))
                    .toList();
        }

        // Also check for broad entitlements (e.g. SUBSCRIPTION covers all)
        if (entitlements.isEmpty()) {
            // Check if user has a subscription-level entitlement (no scope restriction)
            List<Entitlement> broadEntitlements = entitlementRepository.findActiveEntitlements(userId, now)
                    .stream()
                    .filter(e -> e.getScopeType() == null && e.getScopeId() == null)
                    .toList();
            if (!broadEntitlements.isEmpty()) {
                Entitlement broad = broadEntitlements.getFirst();
                return EntitlementCheckResponse.builder()
                        .hasAccess(true)
                        .entitled(true)
                        .reason(broad.getEntitlementType().name())
                        .entitlementType(broad.getEntitlementType())
                        .expiresAt(broad.getExpiresAt())
                        .build();
            }

            return EntitlementCheckResponse.builder()
                    .hasAccess(false)
                    .entitled(false)
                    .reason("NO_ENTITLEMENT")
                    .build();
        }

        Entitlement entitlement = entitlements.getFirst();
        return EntitlementCheckResponse.builder()
                .hasAccess(true)
                .entitled(true)
                .reason(entitlement.getEntitlementType().name())
                .entitlementType(entitlement.getEntitlementType())
                .scopeType(entitlement.getScopeType())
                .scopeId(entitlement.getScopeId())
                .expiresAt(entitlement.getExpiresAt())
                .build();
    }

    public List<EntitlementResponse> getActiveEntitlements(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return entitlementRepository.findActiveEntitlements(userId, now).stream()
                .map(EntitlementResponse::from)
                .toList();
    }

    @Transactional
    public Entitlement grantEntitlement(Long userId, Long purchaseId, EntitlementType type,
                                         String scopeType, Long scopeId, Integer durationDays) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = durationDays != null ? now.plusDays(durationDays) : null;

        Entitlement entitlement = Entitlement.builder()
                .userId(userId)
                .purchaseId(purchaseId)
                .entitlementType(type)
                .scopeType(scopeType)
                .scopeId(scopeId)
                .startsAt(now)
                .expiresAt(expiresAt)
                .build();

        return entitlementRepository.save(entitlement);
    }

    @Transactional
    public void revokeByPurchaseId(Long purchaseId) {
        List<Entitlement> entitlements = entitlementRepository.findByPurchaseId(purchaseId);
        entitlements.forEach(Entitlement::revoke);
    }
}
