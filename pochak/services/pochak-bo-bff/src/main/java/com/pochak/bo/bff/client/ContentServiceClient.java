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

    private static String resourceBasePath(String resource) {
        if (resource == null || resource.isBlank()) {
            return "/";
        }
        return switch (resource) {
            case "vod" -> "/contents/vod";
            case "live" -> "/contents/live";
            case "clips" -> "/contents/clips";
            default -> "/" + resource;
        };
    }

    // --- Generic CRUD pass-through ---

    public JsonNode list(String resource, Map<String, String> params) {
        try {
            return contentClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path(resourceBasePath(resource));
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service list {} call failed: {}", resource, e.getMessage());
            throw e;
        }
    }

    public JsonNode get(String resource, Long id) {
        try {
            String base = resourceBasePath(resource);
            return contentClient.get()
                    .uri(base + "/" + id)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service get {}/{} call failed: {}", resource, id, e.getMessage());
            throw e;
        }
    }

    public JsonNode create(String resource, Map<String, Object> body) {
        String base = resourceBasePath(resource);
        return contentClient.post()
                .uri(base)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode update(String resource, Long id, Map<String, Object> body) {
        String base = resourceBasePath(resource);
        return contentClient.put()
                .uri(base + "/" + id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void delete(String resource, Long id) {
        String base = resourceBasePath(resource);
        contentClient.delete()
                .uri(base + "/" + id)
                .retrieve()
                .toBodilessEntity();
    }
}
