package com.pochak.common.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

class BusinessExceptionTest {

    @Test
    @DisplayName("Should create exception from ErrorCode with default message")
    void testCreateFromErrorCode() {
        // when
        BusinessException ex = new BusinessException(ErrorCode.NOT_FOUND);

        // then
        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND);
        assertThat(ex.getMessage()).isEqualTo("Resource not found");
        assertThat(ex.getHttpStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("Should create exception from ErrorCode with custom message")
    void testCreateFromErrorCodeWithMessage() {
        // when
        BusinessException ex = new BusinessException(ErrorCode.INVALID_INPUT, "Name cannot be empty");

        // then
        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_INPUT);
        assertThat(ex.getMessage()).isEqualTo("Name cannot be empty");
        assertThat(ex.getHttpStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should propagate as RuntimeException")
    void testIsRuntimeException() {
        BusinessException ex = new BusinessException(ErrorCode.INTERNAL_ERROR);
        assertThat(ex).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("All error codes should have valid HTTP status and message")
    void testAllErrorCodes() {
        for (ErrorCode code : ErrorCode.values()) {
            assertThat(code.getHttpStatus()).isNotNull();
            assertThat(code.getMessage()).isNotNull().isNotBlank();
        }
    }
}
