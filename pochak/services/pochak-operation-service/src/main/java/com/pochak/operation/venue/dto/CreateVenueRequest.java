package com.pochak.operation.venue.dto;

import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.VenueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class CreateVenueRequest {

    @NotNull
    private Long sportId;

    @NotBlank
    private String name;

    @NotNull
    private VenueType venueType;

    @NotNull
    private OwnerType ownerType;

    private Long ownerId;
    private String address;
    private String addressDetail;
    private String siGunGuCode;
    private String zipCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;
    private String qrCode;
    private String pixellotClubId;
}
