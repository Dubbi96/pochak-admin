package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebNoticeController {

    private final RestClient adminClient;

    @GetMapping("/notices")
    public ApiResponse<JsonNode> getNotices() {
        try {
            JsonNode result = adminClient.get()
                    .uri("/admin/api/v1/site/notices?size=50&sort=isPinned,desc&sort=createdAt,desc")
                    .retrieve()
                    .body(JsonNode.class);
            return ApiResponse.success(result);
        } catch (RestClientException e) {
            log.warn("Admin service /notices call failed: {}", e.getMessage());
            return ApiResponse.success(null);
        }
    }
}
