package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner/partners/{partnerId}/clubs")
@RequiredArgsConstructor
public class PartnerClubController {

    private final RestClient contentClient;

    @GetMapping("/{clubId}/customization")
    public String getClubCustomization(
            @PathVariable Long partnerId,
            @PathVariable Long clubId) {
        return contentClient.get()
                .uri("/clubs/{clubId}/customization?partnerId={partnerId}", clubId, partnerId)
                .retrieve()
                .body(String.class);
    }

    @PutMapping("/{clubId}/customization")
    public String upsertClubCustomization(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long partnerId,
            @PathVariable Long clubId,
            @RequestBody String body) {
        return contentClient.put()
                .uri("/clubs/{clubId}/customization", clubId)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }
}
