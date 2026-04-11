package com.pochak.operation.product.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.operation.product.dto.CreateVenueProductRequest;
import com.pochak.operation.product.dto.TimeSlotResponse;
import com.pochak.operation.product.dto.UpdateVenueProductRequest;
import com.pochak.operation.product.dto.VenueProductResponse;
import com.pochak.operation.product.entity.VenueProduct;
import com.pochak.operation.product.entity.VenueProductType;
import com.pochak.operation.product.entity.VenueTimeSlot;
import com.pochak.operation.product.repository.VenueProductRepository;
import com.pochak.operation.product.repository.VenueTimeSlotRepository;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class VenueProductServiceTest {

    @InjectMocks
    private VenueProductService venueProductService;

    @Mock
    private VenueProductRepository venueProductRepository;

    @Mock
    private VenueTimeSlotRepository venueTimeSlotRepository;

    @Mock
    private VenueRepository venueRepository;

    private Venue ownedVenue;
    private VenueProduct testProduct;

    @BeforeEach
    void setUp() {
        ownedVenue = Venue.builder()
                .id(10L)
                .sportId(1L)
                .name("Partner Venue")
                .venueType(VenueType.FIXED)
                .ownerType(OwnerType.B2B)
                .ownerId(50L)
                .isActive(true)
                .build();

        testProduct = VenueProduct.builder()
                .id(1L)
                .venueId(10L)
                .name("공간+카메라 패키지 A")
                .description("2시간 기본, 카메라 1대 포함")
                .productType(VenueProductType.SPACE_WITH_CAMERA)
                .pricePerHour(50000)
                .includedCameras(1)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should create venue product for owned venue")
    void testCreateProduct() {
        // given
        CreateVenueProductRequest request = CreateVenueProductRequest.builder()
                .name("공간+카메라 패키지 A")
                .description("2시간 기본, 카메라 1대 포함")
                .productType(VenueProductType.SPACE_WITH_CAMERA)
                .pricePerHour(50000)
                .includedCameras(1)
                .build();

        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));
        given(venueProductRepository.save(any(VenueProduct.class))).willReturn(testProduct);

        // when
        VenueProductResponse result = venueProductService.createProduct(50L, 10L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("공간+카메라 패키지 A");
        assertThat(result.getProductType()).isEqualTo(VenueProductType.SPACE_WITH_CAMERA);
        assertThat(result.getPricePerHour()).isEqualTo(50000);
    }

    @Test
    @DisplayName("Should reject product creation for non-owned venue")
    void testCreateProduct_forbidden() {
        // given
        CreateVenueProductRequest request = CreateVenueProductRequest.builder()
                .name("Test")
                .productType(VenueProductType.SPACE_ONLY)
                .pricePerHour(10000)
                .build();

        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));

        // when & then (userId 999 != ownerId 50)
        assertThatThrownBy(() -> venueProductService.createProduct(999L, 10L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("Should list products for venue")
    void testGetProducts() {
        // given
        given(venueProductRepository.findByVenueIdAndIsActiveTrueOrderByCreatedAtDesc(10L))
                .willReturn(List.of(testProduct));

        // when
        List<VenueProductResponse> results = venueProductService.getProducts(10L);

        // then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("공간+카메라 패키지 A");
    }

    @Test
    @DisplayName("Should update venue product")
    void testUpdateProduct() {
        // given
        UpdateVenueProductRequest request = UpdateVenueProductRequest.builder()
                .name("Updated Package")
                .pricePerHour(60000)
                .includedCameras(2)
                .build();

        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));
        given(venueProductRepository.findByIdAndIsActiveTrue(1L)).willReturn(Optional.of(testProduct));

        // when
        VenueProductResponse result = venueProductService.updateProduct(50L, 10L, 1L, request);

        // then
        assertThat(result.getName()).isEqualTo("Updated Package");
        assertThat(result.getPricePerHour()).isEqualTo(60000);
    }

    @Test
    @DisplayName("Should soft delete venue product")
    void testDeleteProduct() {
        // given
        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));
        given(venueProductRepository.findByIdAndIsActiveTrue(1L)).willReturn(Optional.of(testProduct));

        // when
        venueProductService.deleteProduct(50L, 10L, 1L);

        // then
        assertThat(testProduct.getIsActive()).isFalse();
    }

    @Test
    @DisplayName("Should reject venue not found")
    void testCreateProduct_venueNotFound() {
        // given
        CreateVenueProductRequest request = CreateVenueProductRequest.builder()
                .name("Test")
                .productType(VenueProductType.SPACE_ONLY)
                .pricePerHour(10000)
                .build();

        given(venueRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> venueProductService.createProduct(50L, 999L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Venue not found");
    }

    @Test
    @DisplayName("소유자가 아닌 사용자가 상품을 수정하면 예외가 발생한다")
    void testUpdateProduct_forbidden() {
        // given
        UpdateVenueProductRequest request = UpdateVenueProductRequest.builder()
                .name("Updated")
                .pricePerHour(70000)
                .build();

        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));

        // when & then (userId 999 != ownerId 50)
        assertThatThrownBy(() -> venueProductService.updateProduct(999L, 10L, 1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("소유자가 아닌 사용자가 상품을 삭제하면 예외가 발생한다")
    void testDeleteProduct_forbidden() {
        // given
        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));

        // when & then
        assertThatThrownBy(() -> venueProductService.deleteProduct(999L, 10L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("다른 venue의 상품을 수정하면 예외가 발생한다")
    void testUpdateProduct_productBelongsToDifferentVenue() {
        // given
        VenueProduct otherVenueProduct = VenueProduct.builder()
                .id(2L)
                .venueId(99L) // 다른 venue
                .name("Other Product")
                .productType(VenueProductType.SPACE_ONLY)
                .pricePerHour(30000)
                .isActive(true)
                .build();

        UpdateVenueProductRequest request = UpdateVenueProductRequest.builder()
                .name("Hacked")
                .pricePerHour(1)
                .build();

        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));
        given(venueProductRepository.findByIdAndIsActiveTrue(2L)).willReturn(Optional.of(otherVenueProduct));

        // when & then
        assertThatThrownBy(() -> venueProductService.updateProduct(50L, 10L, 2L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    @DisplayName("다른 venue의 상품을 삭제하면 예외가 발생한다")
    void testDeleteProduct_productBelongsToDifferentVenue() {
        // given
        VenueProduct otherVenueProduct = VenueProduct.builder()
                .id(2L)
                .venueId(99L)
                .name("Other Product")
                .productType(VenueProductType.SPACE_ONLY)
                .pricePerHour(30000)
                .isActive(true)
                .build();

        given(venueRepository.findById(10L)).willReturn(Optional.of(ownedVenue));
        given(venueProductRepository.findByIdAndIsActiveTrue(2L)).willReturn(Optional.of(otherVenueProduct));

        // when & then
        assertThatThrownBy(() -> venueProductService.deleteProduct(50L, 10L, 2L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }

    @Test
    @DisplayName("소프트 삭제된 상품은 조회할 수 없다")
    void testGetProduct_softDeleted_notFound() {
        // given
        given(venueProductRepository.findByIdAndIsActiveTrue(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> venueProductService.getProduct(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Venue product not found");
    }

    @Test
    @DisplayName("상품 가용 시간 슬롯을 정상 조회한다")
    void testGetAvailability_returnsTimeSlots() {
        // given
        VenueTimeSlot slot1 = VenueTimeSlot.builder()
                .id(1L)
                .venueProductId(1L)
                .dayOfWeek(1) // Monday
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(12, 0))
                .isAvailable(true)
                .build();

        VenueTimeSlot slot2 = VenueTimeSlot.builder()
                .id(2L)
                .venueProductId(1L)
                .dayOfWeek(1)
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(18, 0))
                .isAvailable(true)
                .build();

        given(venueProductRepository.findByIdAndIsActiveTrue(1L)).willReturn(Optional.of(testProduct));
        // 2026-05-04는 월요일 (dayOfWeek = 1)
        given(venueTimeSlotRepository.findByVenueProductIdAndDayOfWeekAndIsAvailableTrue(1L, 1))
                .willReturn(List.of(slot1, slot2));

        // when
        List<TimeSlotResponse> result = venueProductService.getAvailability(1L, LocalDate.of(2026, 5, 4));

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStartTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(result.get(1).getStartTime()).isEqualTo(LocalTime.of(14, 0));
    }

    @Test
    @DisplayName("가용 시간 슬롯이 없으면 빈 리스트를 반환한다")
    void testGetAvailability_noSlots_returnsEmpty() {
        // given
        given(venueProductRepository.findByIdAndIsActiveTrue(1L)).willReturn(Optional.of(testProduct));
        given(venueTimeSlotRepository.findByVenueProductIdAndDayOfWeekAndIsAvailableTrue(eq(1L), eq(6)))
                .willReturn(Collections.emptyList());

        // when — 2026-05-09는 토요일 (dayOfWeek = 6)
        List<TimeSlotResponse> result = venueProductService.getAvailability(1L, LocalDate.of(2026, 5, 9));

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("비활성 상품의 가용 시간 조회 시 예외가 발생한다")
    void testGetAvailability_inactiveProduct_throws() {
        // given
        given(venueProductRepository.findByIdAndIsActiveTrue(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> venueProductService.getAvailability(1L, LocalDate.of(2026, 5, 4)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Venue product not found");
    }

    @Test
    @DisplayName("ownerId가 null인 venue에 대해 상품 생성을 시도하면 예외가 발생한다")
    void testCreateProduct_venueWithNullOwner_forbidden() {
        // given
        Venue noOwnerVenue = Venue.builder()
                .id(20L)
                .sportId(1L)
                .name("No Owner Venue")
                .venueType(VenueType.FIXED)
                .ownerType(OwnerType.B2B)
                .ownerId(null)
                .isActive(true)
                .build();

        CreateVenueProductRequest request = CreateVenueProductRequest.builder()
                .name("Test")
                .productType(VenueProductType.SPACE_ONLY)
                .pricePerHour(10000)
                .build();

        given(venueRepository.findById(20L)).willReturn(Optional.of(noOwnerVenue));

        // when & then
        assertThatThrownBy(() -> venueProductService.createProduct(50L, 20L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("permission");
    }
}
