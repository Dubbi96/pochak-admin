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
public class OperationServiceClient {

    private final RestClient operationClient;

    public JsonNode getCameras(String matchId) {
        try {
            return operationClient.get()
                    .uri("/streaming/cameras/{matchId}", matchId)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException e) {
            log.warn("Operation service cameras call failed: {}", e.getMessage());
            return null;
        }
    }
}
