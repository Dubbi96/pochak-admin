package com.pochak.operation.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

/**
 * RestClient-based implementation of ContentServiceClient.
 * Calls Content Service HTTP endpoints to retrieve org and membership data.
 */
@Slf4j
@Component
public class RestClientContentServiceClient implements ContentServiceClient {

    private final RestClient restClient;

    public RestClientContentServiceClient(
            @Value("${pochak.services.content-url:http://localhost:8082}") String contentServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(contentServiceUrl)
                .build();
    }

    @Override
    public OrganizationResponse getOrganization(Long orgId) {
        try {
            JsonNode body = restClient.get()
                    .uri("/api/v1/organizations/{id}", orgId)
                    .retrieve()
                    .body(JsonNode.class);

            if (body == null) {
                log.warn("[ContentClient] Empty response for orgId={}", orgId);
                return null;
            }

            // Unwrap ApiResponse<OrganizationDetailResponse> envelope: { success, data, ... }
            JsonNode data = body.has("data") ? body.get("data") : body;

            String policyStr = data.has("reservationPolicy") && !data.get("reservationPolicy").isNull()
                    ? data.get("reservationPolicy").asText()
                    : null;

            ReservationPolicy policy = null;
            if (policyStr != null) {
                try {
                    policy = ReservationPolicy.valueOf(policyStr);
                } catch (IllegalArgumentException e) {
                    log.warn("[ContentClient] Unknown reservationPolicy '{}' for orgId={}", policyStr, orgId);
                }
            }

            return OrganizationResponse.builder()
                    .id(data.has("id") ? data.get("id").asLong() : orgId)
                    .name(data.has("name") ? data.get("name").asText() : null)
                    .reservationPolicy(policy)
                    .build();

        } catch (HttpClientErrorException.NotFound e) {
            log.warn("[ContentClient] Organization not found: orgId={}", orgId);
            return null;
        } catch (Exception e) {
            log.error("[ContentClient] Failed to get organization: orgId={}, error={}", orgId, e.getMessage());
            return null;
        }
    }

    @Override
    public MembershipResponse getMembership(Long userId, Long orgId) {
        try {
            JsonNode body = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/memberships")
                            .queryParam("userId", userId)
                            .queryParam("orgId", orgId)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (body == null) {
                return null;
            }

            // Unwrap list: { success, data: [...] }
            JsonNode data = body.has("data") ? body.get("data") : body;
            if (!data.isArray() || data.isEmpty()) {
                return null;
            }

            JsonNode first = data.get(0);
            String roleStr = first.has("role") ? first.get("role").asText() : null;
            MembershipRole role = null;
            if (roleStr != null) {
                try {
                    role = MembershipRole.valueOf(roleStr);
                } catch (IllegalArgumentException e) {
                    log.warn("[ContentClient] Unknown MembershipRole '{}' for userId={} orgId={}", roleStr, userId, orgId);
                }
            }

            return MembershipResponse.builder()
                    .userId(userId)
                    .organizationId(orgId)
                    .role(role)
                    .build();

        } catch (Exception e) {
            log.error("[ContentClient] Failed to get membership: userId={}, orgId={}, error={}",
                    userId, orgId, e.getMessage());
            return null;
        }
    }
}
