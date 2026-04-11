package com.pochak.partner.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PartnerProductControllerTest {

    @Mock
    private RestClient operationClient;

    @Mock
    private RestClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private RestClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private PartnerProductController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerProductController(operationClient);
    }

    @Test
    @DisplayName("createProduct should proxy POST with venueId, body, and headers")
    void createProduct_success() {
        // given
        Long userId = 10L;
        Long venueId = 5L;
        String requestBody = "{\"name\":\"Product A\",\"price\":10000}";
        String expectedResponse = "{\"id\":1,\"name\":\"Product A\"}";

        given(operationClient.post()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/api/v1/venues/{venueId}/products", venueId)).willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "10")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body(requestBody)).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.createProduct(userId, venueId, requestBody);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(operationClient).post();
    }

    @Test
    @DisplayName("getProducts should proxy GET with venueId path variable")
    void getProducts_success() {
        // given
        Long venueId = 5L;
        String expectedResponse = "[{\"id\":1,\"name\":\"Product A\"}]";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/api/v1/venues/{venueId}/products", venueId)).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getProducts(venueId);

        // then
        assertThat(result).isEqualTo(expectedResponse);
    }

    @Test
    @DisplayName("getProducts should return empty list when no products")
    void getProducts_emptyList() {
        // given
        Long venueId = 99L;
        String expectedResponse = "[]";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/api/v1/venues/{venueId}/products", venueId)).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getProducts(venueId);

        // then
        assertThat(result).isEqualTo("[]");
    }

    @Test
    @DisplayName("updateProduct should proxy PUT with venueId, productId, body, and headers")
    void updateProduct_success() {
        // given
        Long userId = 10L;
        Long venueId = 5L;
        Long productId = 3L;
        String requestBody = "{\"name\":\"Updated Product\",\"price\":20000}";
        String expectedResponse = "{\"id\":3,\"name\":\"Updated Product\"}";

        given(operationClient.put()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/api/v1/venues/{venueId}/products/{productId}", venueId, productId))
                .willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "10")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body(requestBody)).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.updateProduct(userId, venueId, productId, requestBody);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(operationClient).put();
    }

    @Test
    @DisplayName("deleteProduct should proxy DELETE with venueId, productId, and X-User-Id header")
    void deleteProduct_success() {
        // given
        Long userId = 10L;
        Long venueId = 5L;
        Long productId = 3L;
        ResponseEntity<Void> bodilessEntity = ResponseEntity.noContent().build();

        given(operationClient.delete()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/api/v1/venues/{venueId}/products/{productId}", venueId, productId))
                .willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "10")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.toBodilessEntity()).willReturn(bodilessEntity);

        // when
        controller.deleteProduct(userId, venueId, productId);

        // then
        verify(operationClient).delete();
        verify(responseSpec).toBodilessEntity();
    }
}
