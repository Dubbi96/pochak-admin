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
class PartnerAnalyticsControllerTest {

    @Mock
    private RestClient commerceClient;

    @Mock
    private RestClient operationClient;

    @Mock
    private RestClient.RequestHeadersUriSpec commerceHeadersUriSpec;

    @Mock
    private RestClient.RequestHeadersSpec commerceHeadersSpec;

    @Mock
    private RestClient.ResponseSpec commerceResponseSpec;

    @Mock
    private RestClient.RequestHeadersUriSpec operationHeadersUriSpec;

    @Mock
    private RestClient.RequestHeadersSpec operationHeadersSpec;

    @Mock
    private RestClient.ResponseSpec operationResponseSpec;

    private PartnerAnalyticsController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerAnalyticsController(commerceClient, operationClient);
    }

    @Test
    @DisplayName("getRevenue should proxy GET to commerce-service with userId and date params")
    @SuppressWarnings("unchecked")
    void getRevenue_success() {
        // given
        Long userId = 10L;
        String from = "2024-01-01";
        String to = "2024-12-31";
        String expectedResponse = "{\"totalRevenue\":1000000}";

        given(commerceClient.get()).willReturn(commerceHeadersUriSpec);
        given(commerceHeadersUriSpec.uri(any(Function.class))).willReturn(commerceHeadersSpec);
        given(commerceHeadersSpec.header("X-User-Id", "10")).willReturn(commerceHeadersSpec);
        given(commerceHeadersSpec.retrieve()).willReturn(commerceResponseSpec);
        given(commerceResponseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getRevenue(userId, from, to);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(commerceClient).get();
    }

    @Test
    @DisplayName("getRevenue should handle null date params")
    @SuppressWarnings("unchecked")
    void getRevenue_nullDateParams() {
        // given
        Long userId = 10L;
        String expectedResponse = "{\"totalRevenue\":500000}";

        given(commerceClient.get()).willReturn(commerceHeadersUriSpec);
        given(commerceHeadersUriSpec.uri(any(Function.class))).willReturn(commerceHeadersSpec);
        given(commerceHeadersSpec.header("X-User-Id", "10")).willReturn(commerceHeadersSpec);
        given(commerceHeadersSpec.retrieve()).willReturn(commerceResponseSpec);
        given(commerceResponseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getRevenue(userId, null, null);

        // then
        assertThat(result).isEqualTo(expectedResponse);
    }

    @Test
    @DisplayName("getReservationStats should proxy GET to operation-service with userId and optional venueId")
    @SuppressWarnings("unchecked")
    void getReservationStats_success() {
        // given
        Long userId = 10L;
        Long venueId = 5L;
        String expectedResponse = "{\"pending\":3,\"approved\":10,\"cancelled\":2}";

        given(operationClient.get()).willReturn(operationHeadersUriSpec);
        given(operationHeadersUriSpec.uri(any(Function.class))).willReturn(operationHeadersSpec);
        given(operationHeadersSpec.header("X-User-Id", "10")).willReturn(operationHeadersSpec);
        given(operationHeadersSpec.retrieve()).willReturn(operationResponseSpec);
        given(operationResponseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getReservationStats(userId, venueId);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(operationClient).get();
    }

    @Test
    @DisplayName("getReservationStats should handle null venueId")
    @SuppressWarnings("unchecked")
    void getReservationStats_nullVenueId() {
        // given
        Long userId = 10L;
        String expectedResponse = "{\"pending\":5,\"approved\":20}";

        given(operationClient.get()).willReturn(operationHeadersUriSpec);
        given(operationHeadersUriSpec.uri(any(Function.class))).willReturn(operationHeadersSpec);
        given(operationHeadersSpec.header("X-User-Id", "10")).willReturn(operationHeadersSpec);
        given(operationHeadersSpec.retrieve()).willReturn(operationResponseSpec);
        given(operationResponseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getReservationStats(userId, null);

        // then
        assertThat(result).isEqualTo(expectedResponse);
    }

    @Test
    @DisplayName("getRevenue uses commerceClient, getReservationStats uses operationClient")
    @SuppressWarnings("unchecked")
    void differentClientsUsed() {
        // given - set up commerce client for revenue
        given(commerceClient.get()).willReturn(commerceHeadersUriSpec);
        given(commerceHeadersUriSpec.uri(any(Function.class))).willReturn(commerceHeadersSpec);
        given(commerceHeadersSpec.header("X-User-Id", "1")).willReturn(commerceHeadersSpec);
        given(commerceHeadersSpec.retrieve()).willReturn(commerceResponseSpec);
        given(commerceResponseSpec.body(String.class)).willReturn("{}");

        // given - set up operation client for stats
        given(operationClient.get()).willReturn(operationHeadersUriSpec);
        given(operationHeadersUriSpec.uri(any(Function.class))).willReturn(operationHeadersSpec);
        given(operationHeadersSpec.header("X-User-Id", "1")).willReturn(operationHeadersSpec);
        given(operationHeadersSpec.retrieve()).willReturn(operationResponseSpec);
        given(operationResponseSpec.body(String.class)).willReturn("{}");

        // when
        controller.getRevenue(1L, null, null);
        controller.getReservationStats(1L, null);

        // then
        verify(commerceClient).get();
        verify(operationClient).get();
    }
}
