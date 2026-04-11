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
@RequestMapping("/rbac")
@RequiredArgsConstructor
public class BoRbacController {

    private final AdminServiceClient adminClient;

    // --- Roles ---

    @GetMapping("/roles")
    public ResponseEntity<JsonNode> getRoles() {
        log.debug("BO listing roles");
        return ResponseEntity.ok(adminClient.getRoles());
    }

    @PostMapping("/roles")
    public ResponseEntity<JsonNode> createRole(@RequestBody Map<String, Object> body) {
        log.debug("BO creating role");
        return ResponseEntity.ok(adminClient.createRole(body));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<JsonNode> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating role/{}", id);
        return ResponseEntity.ok(adminClient.updateRole(id, body));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        log.debug("BO deleting role/{}", id);
        adminClient.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    // --- Groups ---

    @GetMapping("/groups")
    public ResponseEntity<JsonNode> getGroups() {
        log.debug("BO listing groups");
        return ResponseEntity.ok(adminClient.getGroups());
    }

    @PostMapping("/groups")
    public ResponseEntity<JsonNode> createGroup(@RequestBody Map<String, Object> body) {
        log.debug("BO creating group");
        return ResponseEntity.ok(adminClient.createGroup(body));
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<JsonNode> updateGroup(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating group/{}", id);
        return ResponseEntity.ok(adminClient.updateGroup(id, body));
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        log.debug("BO deleting group/{}", id);
        adminClient.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

    // --- Menus ---

    @GetMapping("/menus")
    public ResponseEntity<JsonNode> getMenus() {
        log.debug("BO listing menus");
        return ResponseEntity.ok(adminClient.getMenus());
    }

    // --- Functions ---

    @GetMapping("/functions")
    public ResponseEntity<JsonNode> getFunctions() {
        log.debug("BO listing functions");
        return ResponseEntity.ok(adminClient.getFunctions());
    }
}
