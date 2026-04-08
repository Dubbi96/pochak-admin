package com.pochak.gateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global filter that adds security headers to all responses:
 * - Strict-Transport-Security (HSTS)
 * - X-Content-Type-Options
 * - X-Frame-Options
 * - X-XSS-Protection
 * - Referrer-Policy
 *
 * Also redirects HTTP to HTTPS when enabled.
 */
@Component
public class SecurityHeadersFilter implements GlobalFilter, Ordered {

    private static final long HSTS_MAX_AGE = 31536000L; // 1 year

    @Value("${pochak.security.https-redirect:false}")
    private boolean httpsRedirect;

    @Value("${pochak.security.hsts-enabled:true}")
    private boolean hstsEnabled;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // HTTP to HTTPS redirect (when enabled in production)
        if (httpsRedirect && "http".equals(request.getURI().getScheme())) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.MOVED_PERMANENTLY);
            String httpsUrl = request.getURI().toString().replaceFirst("^http://", "https://");
            response.getHeaders().set(HttpHeaders.LOCATION, httpsUrl);
            return response.setComplete();
        }

        // Add security headers to response
        exchange.getResponse().beforeCommit(() -> {
            HttpHeaders headers = exchange.getResponse().getHeaders();

            if (hstsEnabled) {
                headers.set("Strict-Transport-Security",
                        "max-age=" + HSTS_MAX_AGE + "; includeSubDomains; preload");
            }

            headers.set("X-Content-Type-Options", "nosniff");
            headers.set("X-Frame-Options", "DENY");
            headers.set("X-XSS-Protection", "1; mode=block");
            headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
            headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

            return Mono.empty();
        });

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -10; // Run before other filters
    }
}
