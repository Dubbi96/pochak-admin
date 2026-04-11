package com.pochak.web.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pochak.common.response.ApiResponse;
import com.pochak.web.bff.client.CommerceServiceClient;
import com.pochak.web.bff.client.ContentServiceClient;
import com.pochak.web.bff.dto.WebHomeResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class WebHomeControllerTest {

    @Mock
    private ContentServiceClient contentClient;
    @Mock
    private CommerceServiceClient commerceClient;

    @InjectMocks
    private WebHomeController webHomeController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Should return home page data with banners, liveNow, recommended, and products")
    void testGetHome() {
        // given
        ObjectNode homeData = objectMapper.createObjectNode();
        ObjectNode dataNode = objectMapper.createObjectNode();
        dataNode.put("banners", "banner-list");
        dataNode.put("liveNow", "live-list");
        dataNode.put("recommended", "rec-list");
        homeData.set("data", dataNode);

        ObjectNode productsData = objectMapper.createObjectNode();
        productsData.put("data", "product-list");

        given(contentClient.getHome()).willReturn(homeData);
        given(commerceClient.getActiveProducts(5)).willReturn(productsData);

        // when
        ApiResponse<WebHomeResponse> response = webHomeController.getHome();

        // then
        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isNotNull();
        assertThat(response.getData().getBanners()).isNotNull();
        assertThat(response.getData().getLiveNow()).isNotNull();
        assertThat(response.getData().getRecommended()).isNotNull();
        assertThat(response.getData().getFeaturedProducts()).isNotNull();
    }

    @Test
    @DisplayName("Should handle null content service response gracefully")
    void testGetHomeWhenContentServiceReturnsNull() {
        // given
        given(contentClient.getHome()).willReturn(null);
        given(commerceClient.getActiveProducts(5)).willReturn(null);

        // when
        ApiResponse<WebHomeResponse> response = webHomeController.getHome();

        // then
        assertThat(response).isNotNull();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData().getBanners()).isNull();
        assertThat(response.getData().getLiveNow()).isNull();
        assertThat(response.getData().getRecommended()).isNull();
        assertThat(response.getData().getFeaturedProducts()).isNull();
    }

    @Test
    @DisplayName("Should extract fields from flat JSON (without data wrapper)")
    void testGetHomeWithFlatJson() {
        // given
        ObjectNode homeData = objectMapper.createObjectNode();
        homeData.put("banners", "banner-flat");
        homeData.put("liveNow", "live-flat");

        given(contentClient.getHome()).willReturn(homeData);
        given(commerceClient.getActiveProducts(5)).willReturn(null);

        // when
        ApiResponse<WebHomeResponse> response = webHomeController.getHome();

        // then
        assertThat(response.getData().getBanners()).isNotNull();
        assertThat(response.getData().getBanners().asText()).isEqualTo("banner-flat");
    }
}
