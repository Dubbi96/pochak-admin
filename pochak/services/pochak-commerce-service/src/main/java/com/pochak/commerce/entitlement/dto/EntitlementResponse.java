package com.pochak.commerce.entitlement.dto;

import com.pochak.commerce.entitlement.entity.Entitlement;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EntitlementResponse {

    private Long id;
    private Long userId;
    private Long purchaseId;
    private EntitlementType entitlementType;
    private String scopeType;
    private Long scopeId;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static EntitlementResponse from(Entitlement entitlement) {
        return EntitlementResponse.builder()
                .id(entitlement.getId())
                .userId(entitlement.getUserId())
                .purchaseId(entitlement.getPurchaseId())
                .entitlementType(entitlement.getEntitlementType())
                .scopeType(entitlement.getScopeType())
                .scopeId(entitlement.getScopeId())
                .startsAt(entitlement.getStartsAt())
                .expiresAt(entitlement.getExpiresAt())
                .isActive(entitlement.getIsActive())
                .createdAt(entitlement.getCreatedAt())
                .build();
    }
}
