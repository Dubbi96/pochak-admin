package com.pochak.content.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ContentExceptionHandlerTest {

    @InjectMocks
    private ContentExceptionHandler contentExceptionHandler;

    @Test
    @DisplayName("ContentBusinessException 발생 시 올바른 HTTP status + error code 반환")
    void handleContentBusinessException_returnsCorrectStatusAndCode() {
        // given
        ContentBusinessException exception = new ContentBusinessException(ContentErrorCode.CLIP_DURATION_EXCEEDED);

        // when
        ResponseEntity<Map<String, Object>> response =
                contentExceptionHandler.handleContentBusinessException(exception);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("code")).isEqualTo("CLIP_DURATION_EXCEEDED");
        assertThat(response.getBody().get("message")).isNotNull();
    }

    @Test
    @DisplayName("CLIP_DURATION_EXCEEDED -> 400 BAD_REQUEST + 한글 메시지")
    void clipDurationExceeded_returns400WithKoreanMessage() {
        // given
        ContentBusinessException exception = new ContentBusinessException(ContentErrorCode.CLIP_DURATION_EXCEEDED);

        // when
        ResponseEntity<Map<String, Object>> response =
                contentExceptionHandler.handleContentBusinessException(exception);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("code")).isEqualTo("CLIP_DURATION_EXCEEDED");
        assertThat((String) response.getBody().get("message")).isEqualTo("클립 최대 길이는 180초입니다");
    }

    @Test
    @DisplayName("커스텀 메시지가 있는 ContentBusinessException 처리")
    void handleContentBusinessException_withCustomMessage() {
        // given
        ContentBusinessException exception = new ContentBusinessException(
                ContentErrorCode.CLIP_DURATION_EXCEEDED, "Custom error message");

        // when
        ResponseEntity<Map<String, Object>> response =
                contentExceptionHandler.handleContentBusinessException(exception);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("code")).isEqualTo("CLIP_DURATION_EXCEEDED");
        assertThat(response.getBody().get("message")).isEqualTo("Custom error message");
    }
}
