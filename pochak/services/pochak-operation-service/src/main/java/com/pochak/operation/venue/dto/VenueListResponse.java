package com.pochak.operation.venue.dto;

import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VenueListResponse {

    private Long id;
    private String name;
    private VenueType venueType;
    private OwnerType ownerType;
    private Long sportId;
    private String address;
    private String siGunGuCode;
    private Long cameraCount;
    private Boolean isActive;

    public static VenueListResponse from(Venue venue, long cameraCount) {
        return VenueListResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .venueType(venue.getVenueType())
                .ownerType(venue.getOwnerType())
                .sportId(venue.getSportId())
                .address(venue.getAddress())
                .siGunGuCode(venue.getSiGunGuCode())
                .cameraCount(cameraCount)
                .isActive(venue.getIsActive())
                .build();
    }
}
