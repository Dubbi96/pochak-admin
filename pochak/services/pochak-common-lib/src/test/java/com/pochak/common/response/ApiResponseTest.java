package com.pochak.common.response;

import com.pochak.common.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApiResponseTest {

    @Test
    @DisplayName("Should create success response with data")
    void testSuccessWithData() {
        // when
        ApiResponse<String> response = ApiResponse.success("hello");

        // then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isEqualTo("hello");
        assertThat(response.getError()).isNull();
        assertThat(response.getMeta()).isNull();
    }

    @Test
    @DisplayName("Should create success response with data and page meta")
    void testSuccessWithDataAndMeta() {
        // given
        PageMeta meta = PageMeta.of(0, 10, 100, 10);

        // when
        ApiResponse<String> response = ApiResponse.success("data", meta);

        // then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData()).isEqualTo("data");
        assertThat(response.getMeta()).isNotNull();
        assertThat(response.getMeta().getTotalCount()).isEqualTo(100);
    }

    @Test
    @DisplayName("Should create error response from ErrorCode")
    void testErrorFromErrorCode() {
        // when
        ApiResponse<Void> response = ApiResponse.error(ErrorCode.NOT_FOUND);

        // then
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getData()).isNull();
        assertThat(response.getError()).isNotNull();
        assertThat(response.getError().getCode()).isEqualTo("NOT_FOUND");
        assertThat(response.getError().getMessage()).isEqualTo("Resource not found");
    }

    @Test
    @DisplayName("Should create error response with custom message")
    void testErrorWithCustomMessage() {
        // when
        ApiResponse<Void> response = ApiResponse.error(ErrorCode.INVALID_INPUT, "Email is invalid");

        // then
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getError().getCode()).isEqualTo("INVALID_INPUT");
        assertThat(response.getError().getMessage()).isEqualTo("Email is invalid");
    }

    @Test
    @DisplayName("Should create error response from ErrorDetail directly")
    void testErrorFromErrorDetail() {
        // given
        ErrorDetail detail = ErrorDetail.builder()
                .code("CUSTOM_ERROR")
                .message("Custom message")
                .build();

        // when
        ApiResponse<Void> response = ApiResponse.error(detail);

        // then
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getError().getCode()).isEqualTo("CUSTOM_ERROR");
    }
}
