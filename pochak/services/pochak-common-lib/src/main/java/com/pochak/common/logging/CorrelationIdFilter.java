package com.pochak.common.logging;

import com.pochak.common.constant.HeaderConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Servlet filter that propagates or generates a correlation ID for structured log tracing.
 *
 * Reads the X-Correlation-Id header (typically set by the Gateway's CorrelationIdFilter).
 * If absent, generates a new UUID. The value is placed into SLF4J's MDC so that
 * every log statement within the request automatically includes the correlation ID.
 *
 * Usage: Register this filter in each downstream service's filter chain.
 * In logback patterns, use %X{correlationId} to include the value.
 */
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String correlationId = request.getHeader(HeaderConstants.X_CORRELATION_ID);
            if (correlationId == null || correlationId.isBlank()) {
                correlationId = UUID.randomUUID().toString();
            }

            MDC.put(MDC_KEY, correlationId);
            response.setHeader(HeaderConstants.X_CORRELATION_ID, correlationId);

            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
