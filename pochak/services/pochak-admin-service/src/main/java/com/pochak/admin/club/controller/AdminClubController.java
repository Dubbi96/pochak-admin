package com.pochak.admin.club.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.admin.club.dto.UpdateClubStatusRequest;
import com.pochak.admin.club.service.AdminClubService;
import com.pochak.admin.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/api/v1/clubs")
@RequiredArgsConstructor
public class AdminClubController {

    private final AdminClubService adminClubService;

    @GetMapping
    public ResponseEntity<ApiResponse<JsonNode>> listClubs(
            @RequestParam(required = false) String sportId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "0") String page,
            @RequestParam(required = false, defaultValue = "20") String size) {

        Map<String, String> params = new HashMap<>();
        if (sportId != null) params.put("sportId", sportId);
        if (keyword != null) params.put("keyword", keyword);
        params.put("page", page);
        params.put("size", size);

        JsonNode result = adminClubService.listClubs(params);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{clubId}")
    public ResponseEntity<ApiResponse<JsonNode>> getClub(@PathVariable Long clubId) {
        JsonNode result = adminClubService.getClub(clubId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PatchMapping("/{clubId}/status")
    public ResponseEntity<ApiResponse<JsonNode>> updateClubStatus(
            @PathVariable Long clubId,
            @RequestBody UpdateClubStatusRequest request,
            @RequestAttribute(value = "adminUserId", required = false) Long adminUserId,
            HttpServletRequest httpRequest) {

        JsonNode result = adminClubService.updateClubStatus(
                clubId, request.getStatus(), adminUserId,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{clubId}/members")
    public ResponseEntity<ApiResponse<JsonNode>> getClubMembers(@PathVariable Long clubId) {
        JsonNode result = adminClubService.getClubMembers(clubId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
