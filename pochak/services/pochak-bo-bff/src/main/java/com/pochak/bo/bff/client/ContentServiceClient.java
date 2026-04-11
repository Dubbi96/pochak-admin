package com.pochak.bo.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContentServiceClient {

    private final RestClient contentClient;

    public JsonNode getAssetStats() {
        try {
            return contentClient.get()
                    .uri("/admin/assets/stats")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service asset stats call failed: {}", e.getMessage());
            return null;
        }
    }

    // --- Generic CRUD pass-through ---

    public JsonNode list(String resource, Map<String, String> params) {
        try {
            return contentClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/" + resource);
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service list {} call failed: {}", resource, e.getMessage());
            return null;
        }
    }

    public JsonNode get(String resource, Long id) {
        try {
            return contentClient.get()
                    .uri("/{resource}/{id}", resource, id)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service get {}/{} call failed: {}", resource, id, e.getMessage());
            return null;
        }
    }

    public JsonNode create(String resource, Map<String, Object> body) {
        return contentClient.post()
                .uri("/{resource}", resource)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode update(String resource, Long id, Map<String, Object> body) {
        return contentClient.put()
                .uri("/{resource}/{id}", resource, id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void delete(String resource, Long id) {
        contentClient.delete()
                .uri("/{resource}/{id}", resource, id)
                .retrieve()
                .toBodilessEntity();
    }
}
