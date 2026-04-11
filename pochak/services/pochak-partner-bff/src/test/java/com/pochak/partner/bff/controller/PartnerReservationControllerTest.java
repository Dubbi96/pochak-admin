package com.pochak.partner.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PartnerReservationControllerTest {

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

    private PartnerReservationController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerReservationController(operationClient);
    }

    @Test
    @DisplayName("getReservations should proxy GET with query params built from UriBuilder")
    @SuppressWarnings("unchecked")
    void getReservations_success() {
        // given
        Long userId = 10L;
        Long venueId = 5L;
        String status = "PENDING";
        int page = 0;
        int size = 20;
        String expectedResponse = "{\"content\":[],\"totalElements\":0}";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri(any(Function.class))).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "10")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getReservations(userId, venueId, status, page, size);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(operationClient).get();
    }

    @Test
    @DisplayName("getReservations should handle null optional params")
    @SuppressWarnings("unchecked")
    void getReservations_nullOptionalParams() {
        // given
        Long userId = 10L;
        String expectedResponse = "{\"content\":[]}";

        given(operationClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri(any(Function.class))).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "10")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getReservations(userId, null, null, 0, 20);

        // then
        assertThat(result).isEqualTo(expectedResponse);
    }

    @Test
    @DisplayName("approveReservation should send CONFIRMED status to backend")
    void approveReservation_success() {
        // given
        Long userId = 10L;
        Long id = 7L;
        String expectedResponse = "{\"id\":7,\"status\":\"CONFIRMED\"}";

        given(operationClient.put()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/reservations/{id}/status", id)).willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "10")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body("{\"status\":\"CONFIRMED\"}")).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.approveReservation(userId, id);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(requestBodySpec).body("{\"status\":\"CONFIRMED\"}");
    }

    @Test
    @DisplayName("rejectReservation should send CANCELLED status to backend")
    void rejectReservation_success() {
        // given
        Long userId = 10L;
        Long id = 7L;
        String expectedResponse = "{\"id\":7,\"status\":\"CANCELLED\"}";

        given(operationClient.put()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/reservations/{id}/status", id)).willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "10")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body("{\"status\":\"CANCELLED\"}")).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.rejectReservation(userId, id);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(requestBodySpec).body("{\"status\":\"CANCELLED\"}");
    }

    @Test
    @DisplayName("approveReservation should forward X-User-Id header")
    void approveReservation_forwardsHeader() {
        // given
        Long userId = 55L;
        Long id = 1L;

        given(operationClient.put()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/reservations/{id}/status", id)).willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "55")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body("{\"status\":\"CONFIRMED\"}")).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn("{}");

        // when
        controller.approveReservation(userId, id);

        // then
        verify(requestBodySpec).header("X-User-Id", "55");
    }
}
