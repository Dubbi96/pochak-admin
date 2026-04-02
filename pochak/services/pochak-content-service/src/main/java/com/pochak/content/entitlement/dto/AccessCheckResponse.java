package com.pochak.content.entitlement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessCheckResponse {

    private boolean hasAccess;
    private String reason;
    private Map<String, Object> restrictions;

    public static AccessCheckResponse grantAccess(String reason) {
        return AccessCheckResponse.builder()
                .hasAccess(true)
                .reason(reason)
                .build();
    }

    public static AccessCheckResponse grantAccess(String reason, Map<String, Object> restrictions) {
        return AccessCheckResponse.builder()
                .hasAccess(true)
                .reason(reason)
                .restrictions(restrictions)
                .build();
    }

    public static AccessCheckResponse denyAccess(String reason) {
        return AccessCheckResponse.builder()
                .hasAccess(false)
                .reason(reason)
                .build();
    }

    public static AccessCheckResponse denyAccess(String reason, Map<String, Object> restrictions) {
        return AccessCheckResponse.builder()
                .hasAccess(false)
                .reason(reason)
                .restrictions(restrictions)
                .build();
    }
}
