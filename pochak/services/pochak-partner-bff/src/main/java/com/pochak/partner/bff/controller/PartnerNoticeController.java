package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner/notices")
@RequiredArgsConstructor
public class PartnerNoticeController {

    private final RestClient contentClient;

    @GetMapping
    public String getPartnerNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return contentClient.get()
                .uri(uriBuilder -> uriBuilder.path("/notifications")
                        .queryParam("targetType", "PARTNER")
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build())
                .retrieve()
                .body(String.class);
    }
}
