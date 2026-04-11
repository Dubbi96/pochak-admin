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

        JsonNode playerData = contentClient.getPlayerData(type, id);
        JsonNode accessData = contentClient.checkAccess(type, id, userId);

        boolean accessGranted = isAccessGranted(accessData);
        String deniedReason = null;
        JsonNode productSuggestions = null;
        JsonNode cameras = null;

        if (accessGranted) {
            // For live matches, fetch camera views
            if ("match".equalsIgnoreCase(type) || "live".equalsIgnoreCase(type)) {
                cameras = extractData(operationClient.getCameras(id));
            }
        } else {
            deniedReason = extractDeniedReason(accessData);
            productSuggestions = extractData(commerceClient.getProductSuggestions(type, id));
        }

        AppPlayerResponse response = AppPlayerResponse.builder()
                .playerData(accessGranted ? extractData(playerData) : null)
                .accessGranted(accessGranted)
                .accessDeniedReason(deniedReason)
                .cameras(cameras)
                .pipSupported(true)
                .productSuggestions(productSuggestions)
                .build();

        return ApiResponse.success(response);
    }

    private boolean isAccessGranted(JsonNode accessData) {
        if (accessData == null) return false;
        JsonNode data = accessData.has("data") ? accessData.get("data") : accessData;
        return data.has("granted") && data.get("granted").asBoolean(false);
    }

    private String extractDeniedReason(JsonNode accessData) {
        if (accessData == null) return "Service unavailable";
        JsonNode data = accessData.has("data") ? accessData.get("data") : accessData;
        return data.has("reason") ? data.get("reason").asText("Access denied") : "Access denied";
    }

    private JsonNode extractData(JsonNode node) {
        if (node == null) return null;
        return node.has("data") ? node.get("data") : node;
    }
}
