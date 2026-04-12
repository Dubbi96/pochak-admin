package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContextHolder;
import com.pochak.web.bff.client.ContentServiceClient;
import com.pochak.web.bff.client.CommerceServiceClient;
import com.pochak.web.bff.dto.WebPublicLandingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class WebPublicController {

    private final ContentServiceClient contentClient;
    private final CommerceServiceClient commerceClient;

    @GetMapping("/resolve/{slug}")
    public ApiResponse<JsonNode> resolveSlug(@PathVariable String slug) {
        JsonNode resolved = contentClient.resolveSlug(slug);
        return ApiResponse.success(resolved);
    }

    @GetMapping("/slug/check")
    public ApiResponse<JsonNode> checkSlug(@RequestParam String slug) {
        return ApiResponse.success(contentClient.checkSlug(slug));
    }

    @GetMapping("/clubs/{slug}")
    public ApiResponse<WebPublicLandingResponse> getClubLanding(@PathVariable String slug) {
        JsonNode resolved = contentClient.resolveSlug(slug);
        Long resourceId = extractResourceId(resolved);

        JsonNode clubData = contentClient.getClubDetail(resourceId);
        JsonNode products = commerceClient.getActiveProducts(5);

        Long userId = UserContextHolder.getUserId();
        return ApiResponse.success(WebPublicLandingResponse.builder()
                .detail(clubData)
                .products(extractData(products))
                .isAuthenticated(userId != null)
                .build());
    }

    @GetMapping("/competitions/{slug}")
    public ApiResponse<WebPublicLandingResponse> getCompetitionLanding(@PathVariable String slug) {
        JsonNode resolved = contentClient.resolveSlug(slug);
        Long resourceId = extractResourceId(resolved);

        JsonNode competitionData = contentClient.getCompetitionDetail(resourceId);

        Long userId = UserContextHolder.getUserId();
        return ApiResponse.success(WebPublicLandingResponse.builder()
                .detail(competitionData)
                .isAuthenticated(userId != null)
                .build());
    }

    @GetMapping("/organizations/{slug}")
    public ApiResponse<WebPublicLandingResponse> getOrganizationLanding(@PathVariable String slug) {
        JsonNode resolved = contentClient.resolveSlug(slug);
        Long resourceId = extractResourceId(resolved);

        JsonNode orgData = contentClient.getOrganizationDetail(resourceId);

        Long userId = UserContextHolder.getUserId();
        return ApiResponse.success(WebPublicLandingResponse.builder()
                .detail(orgData)
                .isAuthenticated(userId != null)
                .build());
    }

    private Long extractResourceId(JsonNode resolved) {
        if (resolved == null) return null;
        JsonNode data = resolved.has("data") ? resolved.get("data") : resolved;
        return data.has("resourceId") ? data.get("resourceId").asLong() : null;
    }

    private JsonNode extractData(JsonNode node) {
        if (node == null) return null;
        return node.has("data") ? node.get("data") : node;
    }
}
