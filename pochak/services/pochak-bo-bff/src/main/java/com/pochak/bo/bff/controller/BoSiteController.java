package com.pochak.bo.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.bo.bff.client.AdminServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/site")
@RequiredArgsConstructor
public class BoSiteController {

    private final AdminServiceClient adminClient;

    // --- Banners ---

    @GetMapping("/banners")
    public ResponseEntity<JsonNode> getBanners(@RequestParam Map<String, String> params) {
        log.debug("BO listing banners");
        return ResponseEntity.ok(adminClient.getBanners(params));
    }

    @PostMapping("/banners")
    public ResponseEntity<JsonNode> createBanner(@RequestBody Map<String, Object> body) {
        log.debug("BO creating banner");
        return ResponseEntity.ok(adminClient.createBanner(body));
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<JsonNode> updateBanner(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating banner/{}", id);
        return ResponseEntity.ok(adminClient.updateBanner(id, body));
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        log.debug("BO deleting banner/{}", id);
        adminClient.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    // --- Notices ---

    @GetMapping("/notices")
    public ResponseEntity<JsonNode> getNotices(@RequestParam Map<String, String> params) {
        log.debug("BO listing notices");
        return ResponseEntity.ok(adminClient.getNotices(params));
    }

    @PostMapping("/notices")
    public ResponseEntity<JsonNode> createNotice(@RequestBody Map<String, Object> body) {
        log.debug("BO creating notice");
        return ResponseEntity.ok(adminClient.createNotice(body));
    }

    @PutMapping("/notices/{id}")
    public ResponseEntity<JsonNode> updateNotice(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating notice/{}", id);
        return ResponseEntity.ok(adminClient.updateNotice(id, body));
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        log.debug("BO deleting notice/{}", id);
        adminClient.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }
}
