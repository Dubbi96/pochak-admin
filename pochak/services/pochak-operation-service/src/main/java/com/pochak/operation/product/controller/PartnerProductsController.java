package com.pochak.operation.product.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.operation.product.dto.VenueProductResponse;
import com.pochak.operation.product.service.VenueProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Partner-level product queries (cross-venue aggregation).
 */
@RestController
@RequestMapping("/api/v1/venues/products")
@RequiredArgsConstructor
public class PartnerProductsController {

    private final VenueProductService venueProductService;

    /**
     * 소유자 기준 전체 상품 목록
     * GET /api/v1/venues/products/owner?ownerId={ownerId}
     */
    @GetMapping("/owner")
    public ApiResponse<List<VenueProductResponse>> getProductsByOwner(
            @RequestParam Long ownerId) {
        return ApiResponse.success(venueProductService.getProductsByOwner(ownerId));
    }
}
