package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.CommerceServiceClient;
import com.pochak.app.bff.client.ContentServiceClient;
import com.pochak.app.bff.client.OperationServiceClient;
import com.pochak.app.bff.dto.AppPlayerResponse;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AppPlayerController {

    private final ContentServiceClient contentClient;
    private final CommerceServiceClient commerceClient;
    private final OperationServiceClient operationClient;

    @GetMapping("/player/{type}/{id}")
    public ApiResponse<AppPlayerResponse> getPlayer(
            @PathVariable String type,
            @PathVariable String id) {

        Long userId = UserContextHolder.getUserId();
        log.debug("Fetching app player data for {}/{} userId={}", type, id, userId);

        Optional<JsonNode> playerData = contentClient.getPlayerData(type, id);
        Optional<JsonNode> accessData = contentClient.checkAccess(type, id, userId);

        boolean accessGranted = accessData.map(this::isAccessGranted).orElse(false);
        String deniedReason = null;
        JsonNode productSuggestions = null;
        JsonNode cameras = null;

        if (accessGranted) {
            if ("match".equalsIgnoreCase(type) || "live".equalsIgnoreCase(type)) {
                cameras = operationClient.getCameras(id).map(this::extractData).orElse(null);
            }
        } else {
            deniedReason = accessData.map(this::extractDeniedReason).orElse("Service unavailable");
            productSuggestions = commerceClient.getProductSuggestions(type, id)
                    .map(this::extractData).orElse(null);
        }

        AppPlayerResponse response = AppPlayerResponse.builder()
                .playerData(accessGranted ? playerData.map(this::extractData).orElse(null) : null)
                .accessGranted(accessGranted)
                .accessDeniedReason(deniedReason)
                .cameras(cameras)
                .pipSupported(true)
                .productSuggestions(productSuggestions)
                .build();

        return ApiResponse.success(response);
    }

    private boolean isAccessGranted(JsonNode accessData) {
        JsonNode data = accessData.has("data") ? accessData.get("data") : accessData;
        return data.has("granted") && data.get("granted").asBoolean(false);
    }

    private String extractDeniedReason(JsonNode accessData) {
        JsonNode data = accessData.has("data") ? accessData.get("data") : accessData;
        return data.has("reason") ? data.get("reason").asText("Access denied") : "Access denied";
    }

    private JsonNode extractData(JsonNode node) {
        return node.has("data") ? node.get("data") : node;
    }
}
