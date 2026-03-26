package com.pochak.commerce.entitlement.dto;

import com.pochak.commerce.entitlement.entity.EntitlementType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EntitlementCheckResponse {

    private boolean hasAccess;
    private String reason;
    private boolean entitled;
    private EntitlementType entitlementType;
    private String scopeType;
    private Long scopeId;
    private LocalDateTime expiresAt;
}
