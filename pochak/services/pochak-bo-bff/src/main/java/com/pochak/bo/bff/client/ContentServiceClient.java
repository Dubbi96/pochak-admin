package com.pochak.bo.bff.client;

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
public class ContentServiceClient {

    private final RestClient contentClient;

    /** Map BO resource key to content-service base path (flat resources vs nested asset paths). */
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

    public Optional<JsonNode> list(String resource, Map<String, String> params) {
        try {
            String base = resourceBasePath(resource);
            return Optional.ofNullable(
                contentClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path(base);
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service list {} call failed: {}", resource, e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> get(String resource, Long id) {
        try {
            String base = resourceBasePath(resource);
            return Optional.ofNullable(
                contentClient.get()
                        .uri(base + "/" + id)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service get {}/{} call failed: {}", resource, id, e.getMessage());
            return Optional.empty();
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

    // --- Community Admin ---

    public Optional<JsonNode> listCommunityPosts(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/community/posts");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service list admin/community/posts call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode updateCommunityPostStatus(Long id, Map<String, Object> body) {
        return contentClient.patch()
                .uri("/admin/community/posts/{id}/status", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteCommunityPost(Long id, String reason) {
        contentClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/community/posts/{id}")
                        .queryParam("reason", reason)
                        .build(id))
                .retrieve()
                .toBodilessEntity();
    }
}
