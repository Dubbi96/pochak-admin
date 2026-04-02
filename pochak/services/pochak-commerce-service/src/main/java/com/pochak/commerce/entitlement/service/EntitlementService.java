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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EntitlementService {

    private final EntitlementRepository entitlementRepository;

    public EntitlementCheckResponse checkEntitlement(Long userId, EntitlementType type, String scopeType, Long scopeId) {
        LocalDateTime now = LocalDateTime.now();

        // DATA-004: Use scope-filtered DB query instead of loading all then filtering in-memory
        if (scopeType != null && scopeId != null) {
            return entitlementRepository.findActiveByUserTypeAndScope(userId, type, scopeType, scopeId, now)
                    .map(e -> EntitlementCheckResponse.builder()
                            .hasAccess(true)
                            .entitled(true)
                            .reason(e.getEntitlementType().name())
                            .entitlementType(e.getEntitlementType())
                            .scopeType(e.getScopeType())
                            .scopeId(e.getScopeId())
                            .expiresAt(e.getExpiresAt())
                            .build())
                    .orElse(EntitlementCheckResponse.builder()
                            .hasAccess(false)
                            .entitled(false)
                            .reason("NO_ENTITLEMENT")
                            .build());
        }

        List<Entitlement> entitlements = entitlementRepository.findActiveEntitlementsByType(userId, type, now);
        if (entitlements.isEmpty()) {
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

    public EntitlementCheckResponse checkAccess(Long userId, String scopeType, Long scopeId) {
        LocalDateTime now = LocalDateTime.now();

        // DATA-004: Use scope-filtered DB query instead of loading all + in-memory filtering
        if (scopeType != null && scopeId != null) {
            Optional<Entitlement> scoped = entitlementRepository.findActiveByUserAndScope(userId, scopeType, scopeId, now);
            if (scoped.isPresent()) {
                Entitlement e = scoped.get();
                return EntitlementCheckResponse.builder()
                        .hasAccess(true)
                        .entitled(true)
                        .reason(e.getEntitlementType().name())
                        .entitlementType(e.getEntitlementType())
                        .scopeType(e.getScopeType())
                        .scopeId(e.getScopeId())
                        .expiresAt(e.getExpiresAt())
                        .build();
            }
        }

        // DATA-004: Check broad entitlements (subscription-level, no scope) with dedicated query
        Optional<Entitlement> broad = entitlementRepository.findActiveBroadEntitlement(userId, now);
        if (broad.isPresent()) {
            Entitlement e = broad.get();
            return EntitlementCheckResponse.builder()
                    .hasAccess(true)
                    .entitled(true)
                    .reason(e.getEntitlementType().name())
                    .entitlementType(e.getEntitlementType())
                    .expiresAt(e.getExpiresAt())
                    .build();
        }

        return EntitlementCheckResponse.builder()
                .hasAccess(false)
                .entitled(false)
                .reason("NO_ENTITLEMENT")
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
