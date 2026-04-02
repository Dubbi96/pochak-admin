package com.pochak.common.logging;

import com.pochak.common.constant.HeaderConstants;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Auto-configures all {@link RestClient} beans to propagate the
 * {@code X-Correlation-Id} header on outgoing HTTP requests.
 *
 * <p>The correlation ID is read from SLF4J's {@link MDC} (set by
 * {@link CorrelationIdFilter}) and attached as a request header. This ensures
 * end-to-end traceability across synchronous service-to-service calls.</p>
 *
 * <p>This customizer is activated automatically when {@code RestClient} is on the classpath
 * (Spring Boot 3.2+). Services using {@code RestTemplate} should add the interceptor manually
 * or migrate to {@code RestClient}.</p>
 */
@Component
@ConditionalOnClass(RestClient.class)
public class CorrelationIdRestClientCustomizer implements RestClientCustomizer {

    private static final String MDC_KEY = "correlationId";

    @Override
    public void customize(RestClient.Builder builder) {
        builder.requestInterceptor((request, body, execution) -> {
            String correlationId = MDC.get(MDC_KEY);
            if (correlationId != null && !correlationId.isBlank()) {
                request.getHeaders().add(HeaderConstants.X_CORRELATION_ID, correlationId);
            }
            return execution.execute(request, body);
        });
    }
}
