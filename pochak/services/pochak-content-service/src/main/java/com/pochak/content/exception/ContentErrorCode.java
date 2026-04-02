package com.pochak.content.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Content-service-specific error codes.
 * Supplements the common-lib ErrorCode with domain-specific validation errors.
 */
@Getter
@RequiredArgsConstructor
public enum ContentErrorCode {

    CLIP_DURATION_EXCEEDED(HttpStatus.BAD_REQUEST, "클립 최대 길이는 180초입니다");

    private final HttpStatus httpStatus;
    private final String message;
}
