package com.pochak.content.client.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommerceEntitlementCheckResponse {
    private boolean hasAccess;
    private String reason;
    private String entitlementType;
    private String scopeType;
    private Long scopeId;
    private LocalDateTime expiresAt;
}
