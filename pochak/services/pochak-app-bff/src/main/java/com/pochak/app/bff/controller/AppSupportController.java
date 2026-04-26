package com.pochak.app.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.app.bff.client.AdminServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AppSupportController {

    private final AdminServiceClient adminClient;

    @GetMapping("/faqs")
    public ResponseEntity<JsonNode> getFaqs(
            @RequestParam(required = false) String category) {
        log.debug("App getting FAQs category={}", category);
        return adminClient.getFaqs(category)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
