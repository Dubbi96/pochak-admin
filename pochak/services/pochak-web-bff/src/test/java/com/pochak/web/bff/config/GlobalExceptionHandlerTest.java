package com.pochak.web.bff.config;

import com.pochak.common.response.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler handler;

    @Test
    @DisplayName("Should handle client error and return same status code")
    void testHandleClientError() {
        // given
        HttpClientErrorException exception =
                HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found", null, null, null);

        // when
        ResponseEntity<ApiResponse<Void>> response = handler.handleClientError(exception);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getError().getCode()).isEqualTo("INVALID_INPUT");
    }

    @Test
    @DisplayName("Should handle server error and return BAD_GATEWAY")
    void testHandleServerError() {
        // given
        HttpServerErrorException exception =
                HttpServerErrorException.create(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", null, null, null);

        // when
        ResponseEntity<ApiResponse<Void>> response = handler.handleServerError(exception);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getError().getMessage()).isEqualTo("Downstream service error");
    }

    @Test
    @DisplayName("Should handle connection error and return SERVICE_UNAVAILABLE")
    void testHandleConnectionError() {
        // given
        ResourceAccessException exception = new ResourceAccessException("Connection refused");

        // when
        ResponseEntity<ApiResponse<Void>> response = handler.handleConnectionError(exception);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getError().getMessage()).isEqualTo("Service temporarily unavailable");
    }

    @Test
    @DisplayName("Should handle generic error and return INTERNAL_SERVER_ERROR")
    void testHandleGenericError() {
        // given
        Exception exception = new RuntimeException("Unexpected");

        // when
        ResponseEntity<ApiResponse<Void>> response = handler.handleGenericError(exception);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getError().getCode()).isEqualTo("INTERNAL_ERROR");
    }
}
