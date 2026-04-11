package com.pochak.operation.product.dto;

import com.pochak.operation.product.entity.VenueProduct;
import com.pochak.operation.product.entity.VenueProductType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VenueProductResponse {

    private Long id;
    private Long venueId;
    private String name;
    private String description;
    private VenueProductType productType;
    private Integer pricePerHour;
    private Integer pricePerDay;
    private Integer maxCapacity;
    private Integer includedCameras;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VenueProductResponse from(VenueProduct product) {
        return VenueProductResponse.builder()
                .id(product.getId())
                .venueId(product.getVenueId())
                .name(product.getName())
                .description(product.getDescription())
                .productType(product.getProductType())
                .pricePerHour(product.getPricePerHour())
                .pricePerDay(product.getPricePerDay())
                .maxCapacity(product.getMaxCapacity())
                .includedCameras(product.getIncludedCameras())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
