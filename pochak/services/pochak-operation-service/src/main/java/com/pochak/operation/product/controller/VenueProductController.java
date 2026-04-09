package com.pochak.operation.product.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.operation.product.dto.*;
import com.pochak.operation.product.service.VenueProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/venues/{venueId}/products")
@RequiredArgsConstructor
public class VenueProductController {

    private final VenueProductService venueProductService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VenueProductResponse> createProduct(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long venueId,
            @Valid @RequestBody CreateVenueProductRequest request) {
        return ApiResponse.success(venueProductService.createProduct(userId, venueId, request));
    }

    @GetMapping
    public ApiResponse<List<VenueProductResponse>> getProducts(@PathVariable Long venueId) {
        return ApiResponse.success(venueProductService.getProducts(venueId));
    }

    @GetMapping("/{productId}")
    public ApiResponse<VenueProductResponse> getProduct(@PathVariable Long productId) {
        return ApiResponse.success(venueProductService.getProduct(productId));
    }

    @PutMapping("/{productId}")
    public ApiResponse<VenueProductResponse> updateProduct(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long venueId,
            @PathVariable Long productId,
            @Valid @RequestBody UpdateVenueProductRequest request) {
        return ApiResponse.success(venueProductService.updateProduct(userId, venueId, productId, request));
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteProduct(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long venueId,
            @PathVariable Long productId) {
        venueProductService.deleteProduct(userId, venueId, productId);
        return ApiResponse.success(null);
    }

    @GetMapping("/{productId}/availability")
    public ApiResponse<List<TimeSlotResponse>> getAvailability(
            @PathVariable Long productId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.success(venueProductService.getAvailability(productId, date));
    }

    @GetMapping("/{productId}/price-history")
    public ApiResponse<List<PriceHistoryResponse>> getPriceHistory(
            @PathVariable Long venueId,
            @PathVariable Long productId) {
        return ApiResponse.success(venueProductService.getPriceHistory(venueId, productId));
    }
}
