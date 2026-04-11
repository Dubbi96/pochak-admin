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
public class CommerceServiceClient {

    private final RestClient commerceClient;

    public JsonNode getRevenueStats() {
        try {
            return commerceClient.get()
                    .uri("/admin/revenue/stats")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service revenue stats call failed: {}", e.getMessage());
            return null;
        }
    }

    // --- Products ---

    public JsonNode listProducts(Map<String, String> params) {
        try {
            return commerceClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/products");
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service list products call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getProduct(Long id) {
        try {
            return commerceClient.get()
                    .uri("/products/{id}", id)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service get product/{} call failed: {}", id, e.getMessage());
            return null;
        }
    }

    public JsonNode createProduct(Map<String, Object> body) {
        return commerceClient.post()
                .uri("/products")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateProduct(Long id, Map<String, Object> body) {
        return commerceClient.put()
                .uri("/products/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteProduct(Long id) {
        commerceClient.delete()
                .uri("/products/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    // --- Refunds ---

    public JsonNode listRefunds(Map<String, String> params) {
        try {
            return commerceClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path("/refunds");
                        params.forEach(builder::queryParam);
                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service list refunds call failed: {}", e.getMessage());
            return null;
        }
    }

    public JsonNode getRefund(Long id) {
        try {
            return commerceClient.get()
                    .uri("/refunds/{id}", id)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Commerce service get refund/{} call failed: {}", id, e.getMessage());
            return null;
        }
    }

    public JsonNode updateRefund(Long id, Map<String, Object> body) {
        return commerceClient.put()
                .uri("/refunds/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }
}
