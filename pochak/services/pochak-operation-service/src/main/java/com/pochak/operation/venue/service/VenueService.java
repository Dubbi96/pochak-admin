package com.pochak.operation.venue.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.camera.entity.Camera;
import com.pochak.operation.camera.entity.VenueCamera;
import com.pochak.operation.camera.entity.VenueCameraId;
import com.pochak.operation.camera.repository.CameraRepository;
import com.pochak.operation.camera.repository.VenueCameraRepository;
import com.pochak.operation.venue.dto.*;
import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import com.pochak.operation.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VenueService {

    private final VenueRepository venueRepository;
    private final CameraRepository cameraRepository;
    private final VenueCameraRepository venueCameraRepository;

    public List<VenueResponse> getActiveVenues() {
        return venueRepository.findByIsActiveTrue().stream()
                .map(VenueResponse::from)
                .toList();
    }

    public VenueResponse getVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Venue not found: " + id));
        return VenueResponse.from(venue);
    }

    public Page<VenueListResponse> listVenues(OwnerType ownerType, VenueType venueType,
                                               Long sportId, String name, Pageable pageable) {
        return listVenues(ownerType, venueType, sportId, name, null, pageable);
    }

    public Page<VenueListResponse> listVenues(OwnerType ownerType, VenueType venueType,
                                               Long sportId, String name, Long ownerId, Pageable pageable) {
        Page<Venue> page = venueRepository.findByFilters(ownerType, venueType, sportId, name, ownerId, pageable);
        return page.map(venue -> {
            long cameraCount = venueCameraRepository.countByIdVenueId(venue.getId());
            return VenueListResponse.from(venue, cameraCount);
        });
    }

    public VenueDetailResponse getVenueDetail(Long id) {
        Venue venue = findVenueById(id);
        List<VenueCamera> venueCameras = venueCameraRepository.findByIdVenueId(id);
        return VenueDetailResponse.from(venue, venueCameras);
    }

    @Transactional
    public VenueResponse createVenue(CreateVenueRequest request) {
        Venue venue = Venue.builder()
                .sportId(request.getSportId())
                .name(request.getName())
                .venueType(request.getVenueType())
                .ownerType(request.getOwnerType())
                .ownerId(request.getOwnerId())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .siGunGuCode(request.getSiGunGuCode())
                .zipCode(request.getZipCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .qrCode(request.getQrCode())
                .pixellotClubId(request.getPixellotClubId())
                .build();

        Venue saved = venueRepository.save(venue);
        return VenueResponse.from(saved);
    }

    @Transactional
    public VenueResponse updateVenue(Long id, UpdateVenueRequest request) {
        Venue venue = findVenueById(id);
        venue.update(
                request.getSportId(),
                request.getName(),
                request.getVenueType(),
                request.getOwnerType(),
                request.getOwnerId(),
                request.getAddress(),
                request.getAddressDetail(),
                request.getSiGunGuCode(),
                request.getZipCode(),
                request.getLatitude(),
                request.getLongitude(),
                request.getDescription(),
                request.getQrCode(),
                request.getPixellotClubId()
        );
        return VenueResponse.from(venue);
    }

    @Transactional
    public void deleteVenue(Long id) {
        Venue venue = findVenueById(id);
        venue.softDelete();
    }

    @Transactional
    public VenueDetailResponse linkCamera(Long venueId, LinkCameraRequest request) {
        Venue venue = findVenueById(venueId);
        Camera camera = cameraRepository.findById(request.getCameraId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Camera not found: " + request.getCameraId()));

        VenueCameraId vcId = new VenueCameraId(venueId, camera.getId());

        if (venueCameraRepository.existsById(vcId)) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Camera already linked to this venue");
        }

        VenueCamera venueCamera = VenueCamera.builder()
                .id(vcId)
                .venue(venue)
                .camera(camera)
                .position(request.getPosition())
                .build();

        venueCameraRepository.save(venueCamera);

        List<VenueCamera> venueCameras = venueCameraRepository.findByIdVenueId(venueId);
        return VenueDetailResponse.from(venue, venueCameras);
    }

    @Transactional
    public void unlinkCamera(Long venueId, Long cameraId) {
        VenueCameraId vcId = new VenueCameraId(venueId, cameraId);
        if (!venueCameraRepository.existsById(vcId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Camera link not found");
        }
        venueCameraRepository.deleteById(vcId);
    }

    public Page<VenueSearchResponse> searchVenues(String keyword, Long sportId, String siGunGuCode,
                                                    VenueType venueType, OwnerType ownerType,
                                                    Pageable pageable) {
        Page<Venue> page = venueRepository.searchVenues(keyword, sportId, siGunGuCode, venueType, ownerType, pageable);
        return page.map(VenueSearchResponse::from);
    }

    private static final BigDecimal DEFAULT_RADIUS_DEGREE = new BigDecimal("0.05"); // ~5km

    public Page<VenueSearchResponse> getNearbyVenues(BigDecimal lat, BigDecimal lng,
                                                      BigDecimal radiusDegree,
                                                      Pageable pageable) {
        BigDecimal radius = radiusDegree != null ? radiusDegree : DEFAULT_RADIUS_DEGREE;
        BigDecimal minLat = lat.subtract(radius);
        BigDecimal maxLat = lat.add(radius);
        BigDecimal minLng = lng.subtract(radius);
        BigDecimal maxLng = lng.add(radius);

        Page<Venue> page = venueRepository.findNearby(minLat, maxLat, minLng, maxLng, pageable);
        return page.map(VenueSearchResponse::from);
    }

    private Venue findVenueById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Venue not found: " + id));
    }
}
