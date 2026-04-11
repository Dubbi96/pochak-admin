package com.pochak.partner.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
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
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private PartnerVenueController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerVenueController(operationClient);
    }

    @Test
    @DisplayName("getPartnerVenues should proxy GET with ownerId")
    @SuppressWarnings("unchecked")
    void getPartnerVenues_success() {
        Long userId = 10L;
        String expectedResponse = "[{\"id\":1}]";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri(any(Function.class))).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "10")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        String result = controller.getPartnerVenues(userId);

        assertThat(result).isEqualTo(expectedResponse);
        verify(operationClient).get();
    }

    @Test
    @DisplayName("updateVenueSchedule should proxy PUT with request body")
    void updateVenueSchedule_success() {
        Long userId = 10L;
        Long venueId = 3L;
        String body = "{\"timeSlots\":[]}";
        String expectedResponse = "{\"success\":true}";

        given(operationClient.put()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/api/v1/venues/{venueId}/schedule", venueId)).willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "10")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body(body)).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        String result = controller.updateVenueSchedule(userId, venueId, body);

        assertThat(result).isEqualTo(expectedResponse);
    }
}
