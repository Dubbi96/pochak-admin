package com.pochak.operation.venue.dto;

import com.pochak.operation.camera.dto.CameraDetailResponse;
import com.pochak.operation.camera.entity.VenueCamera;
import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class VenueDetailResponse {

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
    private List<LinkedCameraResponse> cameras;

    public static VenueDetailResponse from(Venue venue, List<VenueCamera> venueCameras) {
        List<LinkedCameraResponse> cameras = venueCameras.stream()
                .map(vc -> LinkedCameraResponse.builder()
                        .cameraId(vc.getCamera().getId())
                        .cameraName(vc.getCamera().getName())
                        .serialNumber(vc.getCamera().getSerialNumber())
                        .model(vc.getCamera().getModel())
                        .position(vc.getPosition())
                        .assignedAt(vc.getAssignedAt() != null ? vc.getAssignedAt().toString() : null)
                        .build())
                .toList();

        return VenueDetailResponse.builder()
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
                .cameras(cameras)
                .build();
    }

    @Getter
    @Builder
    public static class LinkedCameraResponse {
        private Long cameraId;
        private String cameraName;
        private String serialNumber;
        private String model;
        private String position;
        private String assignedAt;
    }
}
