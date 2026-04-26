package com.pochak.admin.organization.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Real HTTP implementation of ContentServiceClient using Spring RestClient.
 * Active when pochak.services.content-url is configured (default for non-stub profile).
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "pochak.services.content-url")
public class RestClientContentServiceClient implements ContentServiceClient {

    private final RestClient restClient;

    public RestClientContentServiceClient(
            @Value("${pochak.services.content-url:http://localhost:8082}") String contentServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(contentServiceUrl)
                .build();
    }

    @Override
    public OrganizationVerifyResponse toggleVerification(Long orgId) {
        try {
            JsonNode body = restClient.put()
                    .uri("/organizations/{id}/verify", orgId)
                    .retrieve()
                    .body(JsonNode.class);

            if (body == null) {
                log.warn("[ContentClient] Empty response for toggleVerification orgId={}", orgId);
                return OrganizationVerifyResponse.builder().id(orgId).verified(false).build();
            }

            JsonNode data = body.has("data") ? body.get("data") : body;
            return OrganizationVerifyResponse.builder()
                    .id(data.has("id") ? data.get("id").asLong() : orgId)
                    .name(data.has("name") ? data.get("name").asText() : null)
                    .verified(data.has("verified") && data.get("verified").asBoolean())
                    .build();

        } catch (HttpClientErrorException.NotFound e) {
            log.warn("[ContentClient] Organization not found for verify: orgId={}", orgId);
            return OrganizationVerifyResponse.builder().id(orgId).verified(false).build();
        } catch (Exception e) {
            log.error("[ContentClient] toggleVerification failed: orgId={}, error={}", orgId, e.getMessage());
            return OrganizationVerifyResponse.builder().id(orgId).verified(false).build();
        }
    }

    @Override
    public JsonNode listOrganizations(String orgType, String accessType, String keyword, int page, int size) {
        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString("/organizations")
                    .queryParam("page", page)
                    .queryParam("size", size);
            if (orgType != null && !orgType.isEmpty()) uriBuilder.queryParam("orgType", orgType);
            if (accessType != null && !accessType.isEmpty()) uriBuilder.queryParam("accessType", accessType);
            if (keyword != null && !keyword.isEmpty()) uriBuilder.queryParam("keyword", keyword);

            return restClient.get()
                    .uri(uriBuilder.toUriString())
                    .retrieve()
                    .body(JsonNode.class);

        } catch (Exception e) {
            log.error("[ContentClient] listOrganizations failed: orgType={}, error={}", orgType, e.getMessage());
            return null;
        }
    }
}
