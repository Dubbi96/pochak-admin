package com.pochak.content.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Content-service-specific business exception.
 * Uses ContentErrorCode instead of the common-lib ErrorCode.
 */
@Getter
public class ContentBusinessException extends RuntimeException {

    private final ContentErrorCode errorCode;
    private final String message;
    private final HttpStatus httpStatus;

    public ContentBusinessException(ContentErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.message = errorCode.getMessage();
        this.httpStatus = errorCode.getHttpStatus();
    }

    public ContentBusinessException(ContentErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
        this.httpStatus = errorCode.getHttpStatus();
    }
}
