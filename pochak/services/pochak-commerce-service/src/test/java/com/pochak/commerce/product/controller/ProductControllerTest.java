package com.pochak.commerce.product.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.product.dto.ProductResponse;
import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.product.service.ProductService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    @Test
    @DisplayName("GET /products - should return product list (200)")
    void getProducts_success() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Monthly Subscription")
                .productType(ProductType.SUBSCRIPTION)
                .priceKrw(new BigDecimal("9900"))
                .isActive(true)
                .build();
        Page<ProductResponse> page = new PageImpl<>(List.of(product), pageable, 1);

        given(productService.getProducts(isNull(), isNull(), eq(pageable))).willReturn(page);

        // when
        ResponseEntity<ApiResponse<Page<ProductResponse>>> result =
                productController.getProducts(null, null, pageable);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData().getContent()).hasSize(1);
        assertThat(result.getBody().getData().getContent().get(0).getName()).isEqualTo("Monthly Subscription");
    }

    @Test
    @DisplayName("GET /products - should filter by productType")
    void getProducts_filterByType() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<ProductResponse> page = new PageImpl<>(List.of(), pageable, 0);

        given(productService.getProducts(eq(ProductType.SUBSCRIPTION), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        ResponseEntity<ApiResponse<Page<ProductResponse>>> result =
                productController.getProducts(ProductType.SUBSCRIPTION, null, pageable);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getContent()).isEmpty();
    }

    @Test
    @DisplayName("GET /products/{id} - should return single product")
    void getProduct_success() {
        // given
        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Season Pass")
                .productType(ProductType.SEASON_PASS)
                .priceKrw(new BigDecimal("49900"))
                .build();
        given(productService.getProduct(1L)).willReturn(product);

        // when
        ResponseEntity<ApiResponse<ProductResponse>> result = productController.getProduct(1L);

        // then
        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getData().getName()).isEqualTo("Season Pass");
    }

    @Test
    @DisplayName("GET /products/{id} - should propagate exception when not found")
    void getProduct_notFound() {
        // given
        given(productService.getProduct(99L)).willThrow(new RuntimeException("Product not found"));

        // when / then
        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class,
                () -> productController.getProduct(99L));
    }
}
