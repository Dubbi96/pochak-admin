package com.pochak.operation.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateVenueProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price per hour is required")
    private Integer pricePerHour;

    private Integer pricePerDay;
    private Integer maxCapacity;
    private Integer includedCameras;
    private String priceChangeReason;
}
