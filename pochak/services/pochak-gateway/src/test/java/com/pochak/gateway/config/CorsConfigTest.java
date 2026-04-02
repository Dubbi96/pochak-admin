package com.pochak.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.lang.reflect.Field;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for CorsConfig.
 * Verifies CORS header behavior for allowed/disallowed origins and preflight requests.
 */
class CorsConfigTest {

    private CorsWebFilter corsFilter;
    private WebFilterChain chain;

    @BeforeEach
    void setUp() {
        CorsConfig corsConfig = new CorsConfig();
        try {
            Field field = CorsConfig.class.getDeclaredField("allowedOriginsRaw");
            field.setAccessible(true);
            field.set(corsConfig,
                    "http://localhost:3000,http://localhost:3100,http://localhost:8097,"
                    + "http://localhost:9080,http://localhost:9081,http://localhost:9090,"
                    + "pochak://callback,pochakapp://");
        } catch (Exception e) {
            throw new RuntimeException("Failed to set allowedOriginsRaw", e);
        }

        corsFilter = corsConfig.corsWebFilter();

        chain = mock(WebFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());
    }

    // Helper: build a CORS request with Origin header against a specific host
    private MockServerHttpRequest.BaseBuilder<?> corsGet(String path, String origin) {
        return MockServerHttpRequest
                .get("http://gateway:8080" + path)
                .header(HttpHeaders.ORIGIN, origin);
    }

    private MockServerHttpRequest corsPreflight(String path, String origin, String requestMethod) {
        return MockServerHttpRequest
                .method(HttpMethod.OPTIONS, "http://gateway:8080" + path)
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, requestMethod)
                .build();
    }

    // ======================================================================
    // Preflight OPTIONS requests
    // ======================================================================

    @Nested
    @DisplayName("Preflight OPTIONS request handling")
    class PreflightRequests {

        @Test
        @DisplayName("OPTIONS preflight from allowed origin includes Access-Control-Allow-Origin")
        void preflight_allowedOrigin_includesAcaoHeader() {
            MockServerHttpRequest request = corsPreflight("/api/v1/contents", "http://localhost:3000", "GET");
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isEqualTo("http://localhost:3000");
        }

        @Test
        @DisplayName("OPTIONS preflight returns correct allowed methods")
        void preflight_allowedOrigin_returnsAllowedMethods() {
            MockServerHttpRequest request = corsPreflight("/api/v1/contents", "http://localhost:3000", "POST");
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String methods = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
            assertThat(methods).isNotNull();
            assertThat(methods).contains("GET");
            assertThat(methods).contains("POST");
            assertThat(methods).contains("PUT");
            assertThat(methods).contains("DELETE");
            assertThat(methods).contains("OPTIONS");
        }

        @Test
        @DisplayName("OPTIONS preflight from disallowed origin is rejected")
        void preflight_disallowedOrigin_rejected() {
            MockServerHttpRequest request = corsPreflight("/api/v1/contents", "http://evil.example.com", "GET");
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isNull();
        }
    }

    // ======================================================================
    // Allowed origins (simple CORS requests)
    // ======================================================================

    @Nested
    @DisplayName("Allowed origin CORS header behavior")
    class AllowedOrigins {

        @Test
        @DisplayName("Request from localhost:3000 returns CORS headers")
        void localhost3000_returnsCorsHeaders() {
            MockServerHttpRequest request = corsGet("/api/v1/contents", "http://localhost:3000").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isEqualTo("http://localhost:3000");
        }

        @Test
        @DisplayName("Request from localhost:3100 returns CORS headers")
        void localhost3100_returnsCorsHeaders() {
            MockServerHttpRequest request = corsGet("/api/v1/contents", "http://localhost:3100").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isEqualTo("http://localhost:3100");
        }

        @Test
        @DisplayName("Allow-Credentials header is set to true for allowed origin")
        void allowedOrigin_credentialsTrue() {
            MockServerHttpRequest request = corsGet("/api/v1/contents", "http://localhost:3000").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String credentials = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
            assertThat(credentials).isEqualTo("true");
        }
    }

    // ======================================================================
    // Disallowed origins
    // ======================================================================

    @Nested
    @DisplayName("Disallowed origin CORS header behavior")
    class DisallowedOrigins {

        @Test
        @DisplayName("Request from unknown origin does not return Access-Control-Allow-Origin")
        void unknownOrigin_noCorsHeaders() {
            MockServerHttpRequest request = corsGet("/api/v1/contents", "http://evil.example.com").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isNull();
        }

        @Test
        @DisplayName("Request from wrong port does not return CORS headers")
        void wrongPort_noCorsHeaders() {
            MockServerHttpRequest request = corsGet("/api/v1/contents", "http://localhost:4000").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isNull();
        }
    }

    // ======================================================================
    // Mobile deep link scheme support
    // ======================================================================

    @Nested
    @DisplayName("Mobile deep link scheme (pochak://) handling")
    class MobileDeepLink {

        @Test
        @DisplayName("pochak://callback origin is allowed")
        void pochakScheme_isAllowed() {
            MockServerHttpRequest request = corsGet("/api/v1/auth/oauth2/callback/kakao", "pochak://callback").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isEqualTo("pochak://callback");
        }

        @Test
        @DisplayName("pochakapp:// origin is allowed")
        void pochakappScheme_isAllowed() {
            MockServerHttpRequest request = corsGet("/api/v1/auth/oauth2/callback/apple", "pochakapp://").build();
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String acao = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            assertThat(acao).isEqualTo("pochakapp://");
        }
    }

    // ======================================================================
    // CorsConfig bean validation
    // ======================================================================

    @Nested
    @DisplayName("CorsConfig configuration validation")
    class ConfigValidation {

        @Test
        @DisplayName("CorsConfig produces a non-null CorsWebFilter bean")
        void corsWebFilter_isNotNull() {
            assertThat(corsFilter).isNotNull();
        }

        @Test
        @DisplayName("Max-Age header is set on preflight response")
        void preflight_includesMaxAge() {
            MockServerHttpRequest request = corsPreflight("/api/v1/contents", "http://localhost:3000", "GET");
            MockServerWebExchange exchange = MockServerWebExchange.from(request);

            corsFilter.filter(exchange, chain).block();

            String maxAge = exchange.getResponse().getHeaders()
                    .getFirst(HttpHeaders.ACCESS_CONTROL_MAX_AGE);
            assertThat(maxAge).isEqualTo("3600");
        }
    }
}
