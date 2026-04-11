package com.pochak.partner.bff.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PartnerAuthControllerTest {

    @Mock
    private RestClient identityClient;

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

    private PartnerAuthController controller;

    @BeforeEach
    void setUp() {
        controller = new PartnerAuthController(identityClient);
    }

    @Test
    @DisplayName("getMyPartnerInfo should proxy GET to identity-service with X-User-Id header")
    void getMyPartnerInfo_success() {
        // given
        Long userId = 42L;
        String expectedResponse = "{\"id\":42,\"name\":\"Partner A\"}";

        given(identityClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/api/v1/partners/me")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "42")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.getMyPartnerInfo(userId);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(identityClient).get();
    }

    @Test
    @DisplayName("getMyPartnerInfo should return null when backend returns null")
    void getMyPartnerInfo_nullResponse() {
        // given
        Long userId = 1L;

        given(identityClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri("/api/v1/partners/me")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.header("X-User-Id", "1")).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(null);

        // when
        String result = controller.getMyPartnerInfo(userId);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("register should proxy POST to identity-service with body and headers")
    void register_success() {
        // given
        Long userId = 42L;
        String requestBody = "{\"businessName\":\"My Shop\"}";
        String expectedResponse = "{\"id\":42,\"businessName\":\"My Shop\"}";

        given(identityClient.post()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/api/v1/partners/register")).willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "42")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body(requestBody)).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.register(userId, requestBody);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(identityClient).post();
    }

    @Test
    @DisplayName("register should forward the exact request body to backend")
    void register_forwardsExactBody() {
        // given
        Long userId = 99L;
        String requestBody = "{\"businessName\":\"Cafe\",\"phone\":\"010-1234\"}";
        String expectedResponse = "{\"status\":\"registered\"}";

        given(identityClient.post()).willReturn(requestBodyUriSpec);
        given(requestBodyUriSpec.uri("/api/v1/partners/register")).willReturn(requestBodySpec);
        given(requestBodySpec.header("X-User-Id", "99")).willReturn(requestBodySpec);
        given(requestBodySpec.header("Content-Type", "application/json")).willReturn(requestBodySpec);
        given(requestBodySpec.body(requestBody)).willReturn(requestBodySpec);
        given(requestBodySpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.body(String.class)).willReturn(expectedResponse);

        // when
        String result = controller.register(userId, requestBody);

        // then
        assertThat(result).isEqualTo(expectedResponse);
        verify(requestBodySpec).body(requestBody);
    }
}
