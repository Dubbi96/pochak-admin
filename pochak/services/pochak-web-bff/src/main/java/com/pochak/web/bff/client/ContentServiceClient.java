package com.pochak.web.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContentServiceClient {

    private final RestClient contentClient;

    public JsonNode getHome() {
        try {
            return contentClient.get()
                    .uri("/home")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service /home call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getPlayerData(String type, String id) {
        try {
            return contentClient.get()
                    .uri("/contents/{type}/{id}/player", type, id)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service player call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode checkAccess(String type, String id, Long userId) {
        try {
            return contentClient.get()
                    .uri("/contents/{type}/{id}/access?userId={userId}", type, id, userId)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service access check failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getWatchHistory(Long userId, int size) {
        try {
            return contentClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/users/me/watch-history")
                            .queryParam("size", size)
                            .build())
                    .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service watch-history call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getFavorites(Long userId, int size) {
        try {
            return contentClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/users/me/favorites")
                            .queryParam("size", size)
                            .build())
                    .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Content service favorites call failed: {}", e.getMessage());
            return null;
        }
    }
}
