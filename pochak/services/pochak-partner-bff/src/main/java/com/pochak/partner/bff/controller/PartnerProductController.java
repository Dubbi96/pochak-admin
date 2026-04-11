package com.pochak.partner.bff.controller;

import com.pochak.common.constant.HeaderConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/partner/venues/{venueId}/products")
@RequiredArgsConstructor
public class PartnerProductController {

    private final RestClient operationClient;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String createProduct(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long venueId,
            @RequestBody String body) {
        return operationClient.post()
                .uri("/api/v1/venues/{venueId}/products", venueId)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    @GetMapping
    public String getProducts(@PathVariable Long venueId) {
        return operationClient.get()
                .uri("/api/v1/venues/{venueId}/products", venueId)
                .retrieve()
                .body(String.class);
    }

    @PutMapping("/{productId}")
    public String updateProduct(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long venueId,
            @PathVariable Long productId,
            @RequestBody String body) {
        return operationClient.put()
                .uri("/api/v1/venues/{venueId}/products/{productId}", venueId, productId)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long venueId,
            @PathVariable Long productId) {
        operationClient.delete()
                .uri("/api/v1/venues/{venueId}/products/{productId}", venueId, productId)
                .header(HeaderConstants.X_USER_ID, userId.toString())
                .retrieve()
                .toBodilessEntity();
    }
}
