package com.pochak.app.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminServiceClient {

    private final RestClient adminClient;

    public Optional<JsonNode> getLatestAppVersion(String platform) {
        try {
            return Optional.ofNullable(
                adminClient.get()
                        .uri("/admin/api/v1/app/versions/latest?platform={platform}", platform)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Admin service version check failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getFaqs(String category) {
        try {
            Map<String, String> params = (category != null && !category.isBlank())
                    ? Map.of("category", category)
                    : Map.of();
            return Optional.ofNullable(
                adminClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/api/v1/site/faqs");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Admin service faqs call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
