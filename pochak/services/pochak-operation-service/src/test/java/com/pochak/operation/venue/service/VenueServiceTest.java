package com.pochak.operation.venue.service;

import com.pochak.common.exception.BusinessException;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @InjectMocks
    private VenueService venueService;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private CameraRepository cameraRepository;

    @Mock
    private VenueCameraRepository venueCameraRepository;

    private Venue testVenue;
    private Camera testCamera;

    @BeforeEach
    void setUp() {
        testVenue = Venue.builder()
                .id(1L)
                .sportId(10L)
                .name("Test Stadium")
                .venueType(VenueType.FIXED)
                .ownerType(OwnerType.B2B)
                .address("123 Test St")
                .siGunGuCode("11010")
                .isActive(true)
                .build();

        testCamera = Camera.builder()
                .id(100L)
                .name("Camera 1")
                .serialNumber("SN-001")
                .model("Model X")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should list venues with filters and pagination")
    void testListVenues() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Venue> page = new PageImpl<>(List.of(testVenue), pageable, 1);
        given(venueRepository.findByFilters(eq(OwnerType.B2B), isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);
        given(venueCameraRepository.countByIdVenueId(1L)).willReturn(2L);

        // when
        Page<VenueListResponse> result = venueService.listVenues(OwnerType.B2B, null, null, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Test Stadium");
        assertThat(result.getContent().get(0).getCameraCount()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Should create a new venue")
    void testCreateVenue() {
        // given
        CreateVenueRequest request = new CreateVenueRequest();
        // Use reflection or builder — the existing CreateVenueRequest has no builder
        // For test, we verify the service method calls save
        given(venueRepository.save(any(Venue.class))).willReturn(testVenue);

        // when
        VenueResponse result = venueService.createVenue(request);

        // then
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    @DisplayName("Should link a camera to a venue")
    void testLinkCamera() {
        // given
        given(venueRepository.findById(1L)).willReturn(Optional.of(testVenue));
        given(cameraRepository.findById(100L)).willReturn(Optional.of(testCamera));
        given(venueCameraRepository.existsById(any(VenueCameraId.class))).willReturn(false);

        VenueCamera savedVc = VenueCamera.builder()
                .id(new VenueCameraId(1L, 100L))
                .venue(testVenue)
                .camera(testCamera)
                .position("Center")
                .build();
        given(venueCameraRepository.save(any(VenueCamera.class))).willReturn(savedVc);
        given(venueCameraRepository.findByIdVenueId(1L)).willReturn(List.of(savedVc));

        LinkCameraRequest request = LinkCameraRequest.builder()
                .cameraId(100L)
                .position("Center")
                .build();

        // when
        VenueDetailResponse result = venueService.linkCamera(1L, request);

        // then
        assertThat(result.getCameras()).hasSize(1);
        assertThat(result.getCameras().get(0).getCameraName()).isEqualTo("Camera 1");
    }

    @Test
    @DisplayName("Should filter venues by owner type")
    void testFilterByOwnerType() {
        // given
        Venue b2gVenue = Venue.builder()
                .id(2L).sportId(10L).name("Public Stadium")
                .venueType(VenueType.FIXED).ownerType(OwnerType.B2G)
                .isActive(true).build();

        Pageable pageable = PageRequest.of(0, 20);
        Page<Venue> page = new PageImpl<>(List.of(b2gVenue), pageable, 1);
        given(venueRepository.findByFilters(eq(OwnerType.B2G), isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);
        given(venueCameraRepository.countByIdVenueId(2L)).willReturn(0L);

        // when
        Page<VenueListResponse> result = venueService.listVenues(OwnerType.B2G, null, null, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getOwnerType()).isEqualTo(OwnerType.B2G);
    }

    @Test
    @DisplayName("Should throw exception when venue not found")
    void getVenue_notFound() {
        // given
        given(venueRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> venueService.getVenueDetail(999L))
                .isInstanceOf(BusinessException.class);
    }
}
