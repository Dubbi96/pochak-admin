package com.pochak.identity.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Route C: Social (SNS) signup with phone verification.
 * No login_id or password required.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialSignupRequest {

    @NotBlank(message = "Phone verified token is required")
    private String phoneVerifiedToken;

    @NotBlank(message = "Provider is required")
    private String provider;

    @NotBlank(message = "Provider key is required")
    private String providerKey;

    private String providerEmail;

    private String name;

    @NotNull(message = "Consents are required")
    private Map<String, Boolean> consents;

    private List<String> preferences;
}
