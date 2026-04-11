package com.pochak.bo.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.bo.bff.client.ContentServiceClient;
import com.pochak.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Pass-through controller for BO content management.
 * Proxies CRUD operations to the Content domain service.
 * Supports: sports, teams, competitions, matches, organizations, assets
 */
@Slf4j
@RestController
@RequestMapping("/content")
@RequiredArgsConstructor
public class BoContentManageController {

    private final ContentServiceClient contentClient;

    @GetMapping("/{resource}")
    public ResponseEntity<JsonNode> list(
            @PathVariable String resource,
            @RequestParam Map<String, String> params) {
        log.debug("BO listing {} with params={}", resource, params);
        JsonNode result = contentClient.list(resource, params);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{resource}/{id}")
    public ResponseEntity<JsonNode> get(
            @PathVariable String resource,
            @PathVariable Long id) {
        log.debug("BO getting {}/{}", resource, id);
        JsonNode result = contentClient.get(resource, id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{resource}")
    public ResponseEntity<JsonNode> create(
            @PathVariable String resource,
            @RequestBody Map<String, Object> body) {
        log.debug("BO creating {}", resource);
        JsonNode result = contentClient.create(resource, body);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{resource}/{id}")
    public ResponseEntity<JsonNode> update(
            @PathVariable String resource,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating {}/{}", resource, id);
        JsonNode result = contentClient.update(resource, id, body);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{resource}/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String resource,
            @PathVariable Long id) {
        log.debug("BO deleting {}/{}", resource, id);
        contentClient.delete(resource, id);
        return ResponseEntity.noContent().build();
    }
}
