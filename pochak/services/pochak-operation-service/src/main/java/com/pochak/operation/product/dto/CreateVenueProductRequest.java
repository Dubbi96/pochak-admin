package com.pochak.operation.product.dto;

import com.pochak.operation.product.entity.VenueProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVenueProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Product type is required")
    private VenueProductType productType;

    @NotNull(message = "Price per hour is required")
    private Integer pricePerHour;

    private Integer pricePerDay;
    private Integer maxCapacity;
    private Integer includedCameras;
}
