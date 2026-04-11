package com.pochak.bo.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.bo.bff.client.IdentityServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class BoMemberController {

    private final IdentityServiceClient identityClient;

    @GetMapping
    public ResponseEntity<JsonNode> getMembers(@RequestParam Map<String, String> params) {
        log.debug("BO listing members with params={}", params);
        JsonNode result = identityClient.getMembers(params);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JsonNode> getMember(@PathVariable Long id) {
        log.debug("BO getting member/{}", id);
        JsonNode result = identityClient.getMember(id);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JsonNode> updateMemberStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating member/{} status", id);
        JsonNode result = identityClient.updateMemberStatus(id, body);
        return ResponseEntity.ok(result);
    }
}
