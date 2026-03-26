package com.pochak.operation.venue.dto;

import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class VenueResponse {

    private Long id;
    private Long sportId;
    private String name;
    private VenueType venueType;
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
    private Boolean isActive;

    public static VenueResponse from(Venue venue) {
        return VenueResponse.builder()
                .id(venue.getId())
                .sportId(venue.getSportId())
                .name(venue.getName())
                .venueType(venue.getVenueType())
                .ownerType(venue.getOwnerType())
                .ownerId(venue.getOwnerId())
                .address(venue.getAddress())
                .addressDetail(venue.getAddressDetail())
                .siGunGuCode(venue.getSiGunGuCode())
                .zipCode(venue.getZipCode())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .description(venue.getDescription())
                .qrCode(venue.getQrCode())
                .pixellotClubId(venue.getPixellotClubId())
                .isActive(venue.getIsActive())
                .build();
    }
}
