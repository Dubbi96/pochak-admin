package com.pochak.partner.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PartnerVenueControllerTest {

    @Mock
    private RestClient operationClient;

    @Mock
    private RestClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private RestClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private PartnerVenueController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerVenueController(operationClient);
    }

    @Test
    @DisplayName("getMyVenues should proxy GET with ownerId query param and X-User-Id header")
    void getMyVenues_success() {
        // given
        Long userId = 10L;
        String expectedResponse = "[{\"id\":1,\"name\":\"Venue A\"}]";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/venues?ownerId={userId}", userId)).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "10")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getMyVenues(userId);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(operationClient).get();
    }

    @Test
    @DisplayName("getMyVenues should return empty list when no venues found")
    void getMyVenues_emptyList() {
        // given
        Long userId = 999L;
        String expectedResponse = "[]";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/venues?ownerId={userId}", userId)).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "999")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getMyVenues(userId);

        // then
        assertThat(result).isEqualTo("[]");
    }

    @Test
    @DisplayName("getVenueDetail should proxy GET with venueId path variable and X-User-Id header")
    void getVenueDetail_success() {
        // given
        Long userId = 10L;
        Long venueId = 5L;
        String expectedResponse = "{\"id\":5,\"name\":\"Venue Detail\"}";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/venues/{venueId}", venueId)).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "10")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getVenueDetail(userId, venueId);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(operationClient).get();
    }

    @Test
    @DisplayName("getVenueDetail should forward correct venueId to backend")
    void getVenueDetail_correctVenueId() {
        // given
        Long userId = 1L;
        Long venueId = 42L;
        String expectedResponse = "{\"id\":42}";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/venues/{venueId}", venueId)).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "1")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getVenueDetail(userId, venueId);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(requestHeadersUriSpec).uri("/venues/{venueId}", venueId);
    }
}
