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

    @GetMapping("/roles/{id}")
    public ResponseEntity<JsonNode> getRole(@PathVariable Long id) {
        log.debug("BO get role/{}", id);
        return ResponseEntity.ok(adminClient.getRole(id));
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

    @PutMapping("/roles/{id}/menus")
    public ResponseEntity<JsonNode> assignRoleMenus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO assign menus to role/{}", id);
        return ResponseEntity.ok(adminClient.putRoleMenus(id, body));
    }

    @PutMapping("/roles/{id}/functions")
    public ResponseEntity<JsonNode> assignRoleFunctions(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO assign functions to role/{}", id);
        return ResponseEntity.ok(adminClient.putRoleFunctions(id, body));
    }

    // --- Groups ---

    @GetMapping("/groups")
    public ResponseEntity<JsonNode> getGroups() {
        log.debug("BO listing groups");
        return ResponseEntity.ok(adminClient.getGroups());
    }

    @GetMapping("/groups/{id}")
    public ResponseEntity<JsonNode> getGroup(@PathVariable Long id) {
        log.debug("BO get group/{}", id);
        return ResponseEntity.ok(adminClient.getGroup(id));
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

    @PostMapping("/groups/{id}/members")
    public ResponseEntity<JsonNode> assignGroupMembers(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO assign members to group/{}", id);
        return ResponseEntity.ok(adminClient.postGroupMembers(id, body));
    }

    @DeleteMapping("/groups/{id}/members")
    public ResponseEntity<Void> removeGroupMembers(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO remove members from group/{}", id);
        adminClient.deleteGroupMembers(id, body);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/{id}/roles")
    public ResponseEntity<JsonNode> assignGroupRoles(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO assign roles to group/{}", id);
        return ResponseEntity.ok(adminClient.postGroupRoles(id, body));
    }

    @DeleteMapping("/groups/{id}/roles")
    public ResponseEntity<Void> removeGroupRoles(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO remove roles from group/{}", id);
        adminClient.deleteGroupRoles(id, body);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/groups/{id}/members")
    public ResponseEntity<JsonNode> getGroupMembers(@PathVariable Long id) {
        log.debug("BO list group/{}/members", id);
        return ResponseEntity.ok(adminClient.getGroupMembers(id));
    }

    @GetMapping("/groups/{id}/roles")
    public ResponseEntity<JsonNode> getGroupRoles(@PathVariable Long id) {
        log.debug("BO list group/{}/roles", id);
        return ResponseEntity.ok(adminClient.getGroupRoles(id));
    }

    @GetMapping("/groups/{id}/permissions")
    public ResponseEntity<JsonNode> getGroupPermissions(@PathVariable Long id) {
        log.debug("BO group/{}/permissions", id);
        return ResponseEntity.ok(adminClient.getGroupPermissions(id));
    }

    // --- Menus ---

    @GetMapping("/menus")
    public ResponseEntity<JsonNode> getMenus() {
        log.debug("BO listing menus");
        return ResponseEntity.ok(adminClient.getMenus());
    }

    @GetMapping("/menus/{id}")
    public ResponseEntity<JsonNode> getMenu(@PathVariable Long id) {
        log.debug("BO get menu/{}", id);
        return ResponseEntity.ok(adminClient.getMenu(id));
    }

    @PostMapping("/menus")
    public ResponseEntity<JsonNode> createMenu(@RequestBody Map<String, Object> body) {
        log.debug("BO create menu");
        return ResponseEntity.ok(adminClient.createMenu(body));
    }

    @PutMapping("/menus/{id}")
    public ResponseEntity<JsonNode> updateMenu(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO update menu/{}", id);
        return ResponseEntity.ok(adminClient.updateMenu(id, body));
    }

    @DeleteMapping("/menus/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        log.debug("BO delete menu/{}", id);
        adminClient.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/menus/reorder")
    public ResponseEntity<JsonNode> reorderMenus(@RequestBody Map<String, Object> body) {
        log.debug("BO reorder menus");
        return ResponseEntity.ok(adminClient.reorderMenus(body));
    }

    // --- Functions ---

    @GetMapping("/functions")
    public ResponseEntity<JsonNode> getFunctions() {
        log.debug("BO listing functions");
        return ResponseEntity.ok(adminClient.getFunctions());
    }

    @GetMapping("/functions/{id}")
    public ResponseEntity<JsonNode> getFunction(@PathVariable Long id) {
        log.debug("BO get function/{}", id);
        return ResponseEntity.ok(adminClient.getFunction(id));
    }

    @PostMapping("/functions")
    public ResponseEntity<JsonNode> createFunction(@RequestBody Map<String, Object> body) {
        log.debug("BO create function");
        return ResponseEntity.ok(adminClient.createFunction(body));
    }

    @PutMapping("/functions/{id}")
    public ResponseEntity<JsonNode> updateFunction(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO update function/{}", id);
        return ResponseEntity.ok(adminClient.updateFunction(id, body));
    }

    @DeleteMapping("/functions/{id}")
    public ResponseEntity<Void> deleteFunction(@PathVariable Long id) {
        log.debug("BO delete function/{}", id);
        adminClient.deleteFunction(id);
        return ResponseEntity.noContent().build();
    }

    // --- Back-office members ---

    @GetMapping("/members")
    public ResponseEntity<JsonNode> getRbacMembers(@RequestParam Map<String, String> params) {
        log.debug("BO rbac members list");
        return ResponseEntity.ok(adminClient.getRbacMembers(params));
    }

    @GetMapping("/members/{id}")
    public ResponseEntity<JsonNode> getRbacMember(@PathVariable Long id) {
        log.debug("BO rbac member/{}", id);
        return ResponseEntity.ok(adminClient.getRbacMember(id));
    }

    @PostMapping("/members")
    public ResponseEntity<JsonNode> createRbacMember(@RequestBody Map<String, Object> body) {
        log.debug("BO rbac member create");
        return ResponseEntity.ok(adminClient.createRbacMember(body));
    }

    @PutMapping("/members/{id}")
    public ResponseEntity<JsonNode> updateRbacMember(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO rbac member update/{}", id);
        return ResponseEntity.ok(adminClient.updateRbacMember(id, body));
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> deleteRbacMember(@PathVariable Long id) {
        log.debug("BO rbac member delete/{}", id);
        adminClient.deleteRbacMember(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/members/{id}/block")
    public ResponseEntity<JsonNode> blockRbacMember(@PathVariable Long id) {
        log.debug("BO rbac member block/{}", id);
        return ResponseEntity.ok(adminClient.patchBlockRbacMember(id));
    }

    @PatchMapping("/members/{id}/unblock")
    public ResponseEntity<JsonNode> unblockRbacMember(@PathVariable Long id) {
        log.debug("BO rbac member unblock/{}", id);
        return ResponseEntity.ok(adminClient.patchUnblockRbacMember(id));
    }
}
