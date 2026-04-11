package com.pochak.operation.product.controller;

import com.pochak.operation.product.dto.VenueProductResponse;
import com.pochak.operation.product.entity.VenueProductType;
import com.pochak.operation.product.service.VenueProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class VenueProductControllerTest {

    @InjectMocks
    private VenueProductController venueProductController;

    @Mock
    private VenueProductService venueProductService;

    @Nested
    @DisplayName("GET /api/v1/venues/{venueId}/products")
    class GetProducts {

        @Test
        @DisplayName("Should return products for a venue")
        void getProducts_success() {
            // given
            Long venueId = 1L;
            VenueProductResponse product = VenueProductResponse.builder()
                    .id(10L)
                    .venueId(venueId)
                    .name("Standard Package")
                    .productType(VenueProductType.SPACE_WITH_CAMERA)
                    .pricePerHour(50000)
                    .maxCapacity(30)
                    .includedCameras(2)
                    .isActive(true)
                    .build();
            given(venueProductService.getProducts(venueId)).willReturn(List.of(product));

            // when
            var response = venueProductController.getProducts(venueId);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData()).hasSize(1);
            assertThat(response.getData().get(0).getName()).isEqualTo("Standard Package");
            assertThat(response.getData().get(0).getVenueId()).isEqualTo(venueId);
            verify(venueProductService).getProducts(venueId);
        }

        @Test
        @DisplayName("Should return empty list when venue has no products")
        void getProducts_empty() {
            // given
            Long venueId = 999L;
            given(venueProductService.getProducts(venueId)).willReturn(Collections.emptyList());

            // when
            var response = venueProductController.getProducts(venueId);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData()).isEmpty();
        }
    }

    @Nested
    @DisplayName("GET /api/v1/venues/{venueId}/products/{productId}")
    class GetProduct {

        @Test
        @DisplayName("Should return a single product by id")
        void getProduct_success() {
            // given
            VenueProductResponse product = VenueProductResponse.builder()
                    .id(10L)
                    .venueId(1L)
                    .name("Premium Package")
                    .productType(VenueProductType.SPACE_ONLY)
                    .pricePerDay(200000)
                    .isActive(true)
                    .build();
            given(venueProductService.getProduct(10L)).willReturn(product);

            // when
            var response = venueProductController.getProduct(10L);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData().getId()).isEqualTo(10L);
            assertThat(response.getData().getName()).isEqualTo("Premium Package");
        }
    }
}
