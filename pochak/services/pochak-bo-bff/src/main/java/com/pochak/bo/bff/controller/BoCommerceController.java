package com.pochak.bo.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.bo.bff.client.CommerceServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Pass-through controller for BO commerce management.
 * Proxies CRUD operations to the Commerce domain service.
 * Supports: products, refunds, points, season passes, revenue, gift balls
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class BoCommerceController {

    private final CommerceServiceClient commerceClient;

    // ── Products ────────────────────────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<JsonNode> listProducts(@RequestParam Map<String, String> params) {
        log.debug("BO listing products with params={}", params);
        return ResponseEntity.ok(commerceClient.listProducts(params));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<JsonNode> getProduct(@PathVariable Long id) {
        log.debug("BO getting product/{}", id);
        return ResponseEntity.ok(commerceClient.getProduct(id));
    }

    @PostMapping("/products")
    public ResponseEntity<JsonNode> createProduct(@RequestBody Map<String, Object> body) {
        log.debug("BO creating product");
        return ResponseEntity.ok(commerceClient.createProduct(body));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<JsonNode> updateProduct(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating product/{}", id);
        return ResponseEntity.ok(commerceClient.updateProduct(id, body));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.debug("BO deleting product/{}", id);
        commerceClient.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // ── Refunds ─────────────────────────────────────────────────────────────

    @GetMapping("/refunds")
    public ResponseEntity<JsonNode> listRefunds(@RequestParam Map<String, String> params) {
        log.debug("BO listing refunds with params={}", params);
        return ResponseEntity.ok(commerceClient.listRefunds(params));
    }

    @GetMapping("/refunds/{id}")
    public ResponseEntity<JsonNode> getRefund(@PathVariable Long id) {
        log.debug("BO getting refund/{}", id);
        return ResponseEntity.ok(commerceClient.getRefund(id));
    }

    @PutMapping("/refunds/{id}/process")
    public ResponseEntity<JsonNode> processRefund(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO processing refund/{}", id);
        return ResponseEntity.ok(commerceClient.processRefund(id, body));
    }

    // ── Points ──────────────────────────────────────────────────────────────

    @GetMapping("/commerce/points/summary")
    public ResponseEntity<JsonNode> getPointsSummary() {
        log.debug("BO getting points summary");
        return commerceClient.getPointsSummary()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/commerce/points/users")
    public ResponseEntity<JsonNode> getUserPoints(@RequestParam Map<String, String> params) {
        log.debug("BO getting user points with params={}", params);
        return commerceClient.getUserPoints(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Season Pass ─────────────────────────────────────────────────────────

    @GetMapping("/commerce/season-passes/stats")
    public ResponseEntity<JsonNode> getSeasonPassStats(@RequestParam Map<String, String> params) {
        log.debug("BO getting season pass stats with params={}", params);
        return commerceClient.getSeasonPassStats(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/commerce/season-passes/history")
    public ResponseEntity<JsonNode> getSeasonPassHistory(@RequestParam Map<String, String> params) {
        log.debug("BO getting season pass history with params={}", params);
        return commerceClient.getSeasonPassHistory(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/commerce/revenue/daily")
    public ResponseEntity<JsonNode> getDailyRevenue(@RequestParam Map<String, String> params) {
        log.debug("BO getting daily revenue with params={}", params);
        return commerceClient.getDailyRevenue(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Gift Ball ────────────────────────────────────────────────────────────

    @GetMapping("/commerce/gift-balls")
    public ResponseEntity<JsonNode> listGiftBalls(@RequestParam Map<String, String> params) {
        log.debug("BO listing gift balls with params={}", params);
        return commerceClient.listGiftBalls(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/commerce/gift-balls")
    public ResponseEntity<JsonNode> grantGiftBall(@RequestBody Map<String, Object> body) {
        log.debug("BO granting gift ball");
        return ResponseEntity.ok(commerceClient.grantGiftBall(body));
    }
}
