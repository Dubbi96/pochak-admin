package com.pochak.operation.venue.dto;

import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class VenueSearchResponse {

    private Long id;
    private String name;
    private Long sportId;
    private VenueType venueType;
    private OwnerType ownerType;
    private String address;
    private String addressDetail;
    private String siGunGuCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;

    public static VenueSearchResponse from(Venue venue) {
        return VenueSearchResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .sportId(venue.getSportId())
                .venueType(venue.getVenueType())
                .ownerType(venue.getOwnerType())
                .address(venue.getAddress())
                .addressDetail(venue.getAddressDetail())
                .siGunGuCode(venue.getSiGunGuCode())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .description(venue.getDescription())
                .build();
    }
}
