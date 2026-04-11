package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContextHolder;
import com.pochak.web.bff.client.CommerceServiceClient;
import com.pochak.web.bff.client.ContentServiceClient;
import com.pochak.web.bff.dto.WebPlayerResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebPlayerController {

    private final ContentServiceClient contentClient;
    private final CommerceServiceClient commerceClient;

    @GetMapping("/player/{type}/{id}")
    public ApiResponse<WebPlayerResponse> getPlayer(
            @PathVariable String type,
            @PathVariable String id) {

        Long userId = UserContextHolder.getUserId();
        log.debug("Fetching player data for {}/{} userId={}", type, id, userId);

        JsonNode playerData = contentClient.getPlayerData(type, id);
        JsonNode accessData = contentClient.checkAccess(type, id, userId);

        boolean accessGranted = isAccessGranted(accessData);
        String deniedReason = null;
        JsonNode productSuggestions = null;

        if (!accessGranted) {
            deniedReason = extractDeniedReason(accessData);
            productSuggestions = extractData(commerceClient.getProductSuggestions(type, id));
        }

        WebPlayerResponse response = WebPlayerResponse.builder()
                .playerData(accessGranted ? extractData(playerData) : null)
                .accessGranted(accessGranted)
                .accessDeniedReason(deniedReason)
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
