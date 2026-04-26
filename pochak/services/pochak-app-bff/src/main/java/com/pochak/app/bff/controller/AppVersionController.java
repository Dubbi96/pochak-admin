package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.AdminServiceClient;
import com.pochak.app.bff.dto.AppVersionResponse;
import com.pochak.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AppVersionController {

    private final AdminServiceClient adminClient;

    @GetMapping("/version/check")
    public ApiResponse<AppVersionResponse> checkVersion(
            @RequestParam(defaultValue = "AOS") String platform) {

        log.debug("Checking app version for platform={}", platform);
        Optional<JsonNode> versionData = adminClient.getLatestAppVersion(platform);

        if (versionData.isEmpty()) {
            return ApiResponse.success(AppVersionResponse.builder()
                    .forceUpdate(false)
                    .build());
        }

        JsonNode raw = versionData.get();
        JsonNode data = raw.has("data") ? raw.get("data") : raw;

        AppVersionResponse response = AppVersionResponse.builder()
                .currentVersion(data.has("currentVersion") ? data.get("currentVersion").asText() : null)
                .minimumVersion(data.has("minimumVersion") ? data.get("minimumVersion").asText() : null)
                .forceUpdate(data.has("forceUpdate") && data.get("forceUpdate").asBoolean(false))
                .build();

        return ApiResponse.success(response);
    }
}
