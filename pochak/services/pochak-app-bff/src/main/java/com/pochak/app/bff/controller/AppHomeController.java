package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.CommerceServiceClient;
import com.pochak.app.bff.client.ContentServiceClient;
import com.pochak.app.bff.dto.AppHomeResponse;
import com.pochak.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AppHomeController {

    private final ContentServiceClient contentClient;
    private final CommerceServiceClient commerceClient;

    @GetMapping("/home")
    public ApiResponse<AppHomeResponse> getHome() {
        log.debug("Fetching app home page data");

        Optional<JsonNode> homeData = contentClient.getHome();
        Optional<JsonNode> productsData = commerceClient.getActiveProducts(3);

        JsonNode liveNow = homeData.map(d -> extractField(d, "liveNow")).orElse(null);
        int liveCount = liveNow != null && liveNow.isArray() ? liveNow.size() : 0;

        AppHomeResponse response = AppHomeResponse.builder()
                .banners(homeData.map(d -> extractField(d, "banners")).orElse(null))
                .liveNow(liveNow)
                .liveCount(liveCount)
                .recommended(homeData.map(d -> extractField(d, "recommended")).orElse(null))
                .featuredProducts(productsData.map(this::extractData).orElse(null))
                .build();

        return ApiResponse.success(response);
    }

    private JsonNode extractField(JsonNode node, String field) {
        JsonNode data = node.has("data") ? node.get("data") : node;
        return data.has(field) ? data.get(field) : null;
    }

    private JsonNode extractData(JsonNode node) {
        return node.has("data") ? node.get("data") : node;
    }
}
