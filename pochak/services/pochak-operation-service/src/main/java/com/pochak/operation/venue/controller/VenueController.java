package com.pochak.operation.venue.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.operation.venue.dto.*;
import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.VenueType;
import com.pochak.operation.venue.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @GetMapping("/search")
    public ApiResponse<List<VenueSearchResponse>> searchVenues(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String siGunGuCode,
            @RequestParam(required = false) VenueType venueType,
            @RequestParam(required = false) OwnerType ownerType,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<VenueSearchResponse> page = venueService.searchVenues(
                keyword, sportId, siGunGuCode, venueType, ownerType, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/nearby")
    public ApiResponse<List<VenueSearchResponse>> getNearbyVenues(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(required = false) BigDecimal radiusDegree,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<VenueSearchResponse> page = venueService.getNearbyVenues(lat, lng, radiusDegree, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping
    public ApiResponse<List<VenueListResponse>> listVenues(
            @RequestParam(required = false) OwnerType ownerType,
            @RequestParam(required = false) VenueType venueType,
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long ownerId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<VenueListResponse> page = venueService.listVenues(ownerType, venueType, sportId, name, ownerId, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{id}")
    public ApiResponse<VenueDetailResponse> getVenue(@PathVariable Long id) {
        return ApiResponse.success(venueService.getVenueDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VenueResponse> createVenue(@Valid @RequestBody CreateVenueRequest request) {
        return ApiResponse.success(venueService.createVenue(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<VenueResponse> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVenueRequest request) {
        return ApiResponse.success(venueService.updateVenue(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/cameras")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VenueDetailResponse> linkCamera(
            @PathVariable Long id,
            @Valid @RequestBody LinkCameraRequest request) {
        return ApiResponse.success(venueService.linkCamera(id, request));
    }

    @DeleteMapping("/{id}/cameras/{cameraId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> unlinkCamera(
            @PathVariable Long id,
            @PathVariable Long cameraId) {
        venueService.unlinkCamera(id, cameraId);
        return ApiResponse.success(null);
    }
}
