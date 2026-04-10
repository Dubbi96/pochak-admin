package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.response.ApiResponse;
import com.pochak.web.bff.client.CommerceServiceClient;
import com.pochak.web.bff.client.ContentServiceClient;
import com.pochak.web.bff.dto.WebHomeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebHomeController {

    private final ContentServiceClient contentClient;
    private final CommerceServiceClient commerceClient;

    @GetMapping("/home")
    public ApiResponse<WebHomeResponse> getHome() {
        log.debug("Fetching web home page data");

        JsonNode homeData = contentClient.getHome();
        JsonNode productsData = commerceClient.getActiveProducts(5);

        WebHomeResponse response = WebHomeResponse.builder()
                .banners(extractField(homeData, "mainBanners"))
                .liveNow(extractField(homeData, "liveContents"))
                .recommended(extractField(homeData, "competitionBanners"))
                .featuredProducts(extractData(productsData))
                .build();

        return ApiResponse.success(response);
    }

    private JsonNode extractField(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode data = node.has("data") ? node.get("data") : node;
        return data.has(field) ? data.get(field) : null;
    }

    private JsonNode extractData(JsonNode node) {
        if (node == null) return null;
        return node.has("data") ? node.get("data") : node;
    }
}
