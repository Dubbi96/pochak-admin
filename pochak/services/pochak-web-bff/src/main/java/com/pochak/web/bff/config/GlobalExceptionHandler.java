package com.pochak.web.bff.config;

import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<ApiResponse<Void>> handleClientError(HttpClientErrorException e) {
        log.warn("Domain service returned client error: {} {}", e.getStatusCode(), e.getMessage());
        return ResponseEntity.status(e.getStatusCode())
                .body(ApiResponse.error(ErrorCode.INVALID_INPUT, e.getMessage()));
    }

    @ExceptionHandler(HttpServerErrorException.class)
    public ResponseEntity<ApiResponse<Void>> handleServerError(HttpServerErrorException e) {
        log.error("Domain service returned server error: {} {}", e.getStatusCode(), e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, "Downstream service error"));
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleConnectionError(ResourceAccessException e) {
        log.error("Cannot connect to domain service: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, "Service temporarily unavailable"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericError(Exception e) {
        log.error("Unexpected error in BFF", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR));
    }
}
