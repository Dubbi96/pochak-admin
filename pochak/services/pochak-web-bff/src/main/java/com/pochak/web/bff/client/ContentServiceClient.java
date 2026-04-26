package com.pochak.web.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.constant.HeaderConstants;
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

    public Optional<JsonNode> getHome() {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri("/home")
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service /home call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getPlayerData(String type, String id) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri("/contents/{type}/{id}/player", type, id)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service player call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> checkAccess(String type, String id, Long userId) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri("/contents/{type}/{id}/access?userId={userId}", type, id, userId)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service access check failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getWatchHistory(Long userId, int size) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/users/me/watch-history")
                                .queryParam("size", size)
                                .build())
                        .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service watch-history call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> resolveSlug(String slug) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri("/public/resolve/{slug}", slug)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service slug resolve failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> checkSlug(String slug) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/public/slug/check")
                                .queryParam("slug", slug)
                                .build())
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service slug check failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getClubDetail(Long clubId) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri("/clubs/{clubId}", clubId)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service club detail failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getCompetitionDetail(Long competitionId) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri("/competitions/{id}", competitionId)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service competition detail failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getOrganizationDetail(Long organizationId) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri("/organizations/{id}", organizationId)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service organization detail failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getFavorites(Long userId, int size) {
        try {
            return Optional.ofNullable(
                contentClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/users/me/favorites")
                                .queryParam("size", size)
                                .build())
                        .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Content service favorites call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
