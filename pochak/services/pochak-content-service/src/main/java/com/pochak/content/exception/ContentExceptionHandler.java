package com.pochak.content.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@Slf4j
@RestControllerAdvice
public class ContentExceptionHandler {

    @ExceptionHandler(ContentBusinessException.class)
    public ResponseEntity<Map<String, Object>> handleContentBusinessException(ContentBusinessException e) {
        log.warn("ContentBusinessException: code={}, message={}", e.getErrorCode(), e.getMessage());
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(Map.of(
                        "code", e.getErrorCode().name(),
                        "message", e.getMessage()
                ));
    }
}
