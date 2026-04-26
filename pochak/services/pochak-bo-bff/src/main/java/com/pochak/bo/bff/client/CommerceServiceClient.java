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
public class CommerceServiceClient {

    private final RestClient commerceClient;

    public JsonNode getRevenueStats() {
        return commerceClient.get()
                .uri("/admin/revenue/stats")
                .retrieve()
                .body(JsonNode.class);
    }

    // --- Products ---

    public JsonNode listProducts(Map<String, String> params) {
        return commerceClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/products");
                    params.forEach(builder::queryParam);
                    return builder.build();
                })
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getProduct(Long id) {
        return commerceClient.get()
                .uri("/products/{id}", id)
                .retrieve()
                .body(JsonNode.class);
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
        return commerceClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/refunds");
                    params.forEach(builder::queryParam);
                    return builder.build();
                })
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getRefund(Long id) {
        return commerceClient.get()
                .uri("/refunds/{id}", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode processRefund(Long id, Map<String, Object> body) {
        return commerceClient.put()
                .uri("/refunds/{id}/process", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    // --- Points ---

    public Optional<JsonNode> getPointsSummary() {
        try {
            return Optional.ofNullable(
                commerceClient.get()
                        .uri("/admin/commerce/points/summary")
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Commerce service points/summary call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getUserPoints(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                commerceClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/commerce/points/users");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Commerce service points/users call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    // --- Season Pass ---

    public Optional<JsonNode> getSeasonPassStats(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                commerceClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/commerce/season-passes/stats");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Commerce service season-passes/stats call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getSeasonPassHistory(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                commerceClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/commerce/season-passes/history");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Commerce service season-passes/history call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getDailyRevenue(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                commerceClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/commerce/revenue/daily");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Commerce service revenue/daily call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    // --- Gift Ball ---

    public Optional<JsonNode> listGiftBalls(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                commerceClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/commerce/gift-balls");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Commerce service gift-balls call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode grantGiftBall(Map<String, Object> body) {
        return commerceClient.post()
                .uri("/admin/commerce/gift-balls")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }
}
