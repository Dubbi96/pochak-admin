package com.pochak.app.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommerceServiceClient {

    private final RestClient commerceClient;

    public JsonNode getActiveProducts(int size) {
        try {
            return commerceClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/products")
                            .queryParam("isActive", true)
                            .queryParam("size", size)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service products call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getWallet(Long userId) {
        try {
            return commerceClient.get()
                    .uri("/wallet")
                    .header(HeaderConstants.X_USER_ID, String.valueOf(userId))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service wallet call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getProductSuggestions(String contentType, String contentId) {
        try {
            return commerceClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/products")
                            .queryParam("contentType", contentType)
                            .queryParam("contentId", contentId)
                            .queryParam("isActive", true)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service product suggestions call failed: {}", e.getMessage());
            return null;
        }
    }
}
