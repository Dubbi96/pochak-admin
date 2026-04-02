package com.pochak.content.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Inter-service client to verify guardian relationships with identity-service.
 * Used when assigning GUARDIAN membership role to validate the relationship exists and is VERIFIED.
 */
@Component
@Slf4j
public class IdentityGuardianClient {

    private final RestClient identityRestClient;

    public IdentityGuardianClient(
            @Value("${pochak.services.identity.base-url:http://localhost:8081}") String baseUrl) {
        this.identityRestClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Check if a verified guardian relationship exists between the given guardian and minor.
     * Returns false on any error (fail-closed for security).
     */
    public boolean isVerifiedGuardian(Long guardianId, Long minorId) {
        try {
            Map<String, Object> response = identityRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/guardians/verify-relationship")
                            .queryParam("guardianId", guardianId)
                            .queryParam("minorId", minorId)
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.get("data") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                return Boolean.TRUE.equals(data.get("verified"));
            }
            return false;
        } catch (Exception e) {
            log.warn("Failed to verify guardian relationship guardianId={}, minorId={}: {}",
                    guardianId, minorId, e.getMessage());
            return false;
        }
    }
}
