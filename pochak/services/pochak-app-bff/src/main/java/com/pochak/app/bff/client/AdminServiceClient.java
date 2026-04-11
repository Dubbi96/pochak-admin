package com.pochak.app.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminServiceClient {

    private final RestClient adminClient;

    public JsonNode getLatestAppVersion(String platform) {
        try {
            return adminClient.get()
                    .uri("/admin/api/v1/app/versions/latest?platform={platform}", platform)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Admin service version check failed: {}", e.getMessage());
            return null;
        }
    }
}
