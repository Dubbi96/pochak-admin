package com.pochak.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final String X_CORRELATION_ID = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String correlationId;

        if (request.getHeaders().containsKey(X_CORRELATION_ID)) {
            correlationId = request.getHeaders().getFirst(X_CORRELATION_ID);
        } else {
            correlationId = UUID.randomUUID().toString();
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header(X_CORRELATION_ID, correlationId)
                    .build();
            exchange = exchange.mutate().request(mutatedRequest).build();
        }

        // Propagate correlation ID in the response header for client tracing
        exchange.getResponse().getHeaders().addIfAbsent(X_CORRELATION_ID, correlationId);

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
