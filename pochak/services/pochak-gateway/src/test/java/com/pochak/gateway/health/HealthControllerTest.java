package com.pochak.gateway.health;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for HealthController.
 * Uses OkHttp MockWebServer to simulate downstream service responses.
 */
class HealthControllerTest {

    private static MockWebServer mockServer;
    private static HealthController healthController;

    @BeforeAll
    static void setUp() throws IOException {
        mockServer = new MockWebServer();
        mockServer.start();

        String baseUrl = "http://localhost:" + mockServer.getPort();

        healthController = new HealthController(
                WebClient.builder(),
                baseUrl,  // identity
                baseUrl,  // content
                baseUrl,  // commerce
                baseUrl,  // operation
                baseUrl,  // admin
                baseUrl,  // web-bff
                baseUrl,  // app-bff
                baseUrl   // bo-bff
        );
    }

    @AfterAll
    static void tearDown() throws IOException {
        mockServer.shutdown();
    }

    // ======================================================================
    // /health endpoint
    // ======================================================================

    @Test
    @DisplayName("/health returns gateway status UP with service name and timestamp")
    void health_returnsGatewayStatus() {
        Mono<Map<String, Object>> result = healthController.health();
        Map<String, Object> body = result.block();

        assertThat(body).isNotNull();
        assertThat(body.get("service")).isEqualTo("pochak-gateway");
        assertThat(body.get("status")).isEqualTo("UP");
        assertThat(body.get("timestamp")).isNotNull();
    }

    // ======================================================================
    // /health/services endpoint
    // ======================================================================

    @Test
    @DisplayName("/health/services returns 8 service entries when all services are UP")
    void serviceHealth_returns8Services_allUp() {
        // Enqueue 8 successful responses (one per service)
        for (int i = 0; i < 8; i++) {
            mockServer.enqueue(new MockResponse()
                    .setBody("{\"status\":\"UP\"}")
                    .addHeader("Content-Type", "application/json"));
        }

        Mono<Map<String, ServiceHealth>> result = healthController.serviceHealth();
        Map<String, ServiceHealth> services = result.block();

        assertThat(services).isNotNull();
        assertThat(services).hasSize(8);

        // All should be UP
        services.values().forEach(health ->
                assertThat(health.getStatus()).isEqualTo("UP")
        );
    }

    @Test
    @DisplayName("/health/services includes all 5 core services")
    void serviceHealth_includesCoreServices() {
        for (int i = 0; i < 8; i++) {
            mockServer.enqueue(new MockResponse()
                    .setBody("{\"status\":\"UP\"}")
                    .addHeader("Content-Type", "application/json"));
        }

        Map<String, ServiceHealth> services = healthController.serviceHealth().block();

        assertThat(services).containsKey("identity-service");
        assertThat(services).containsKey("content-service");
        assertThat(services).containsKey("commerce-service");
        assertThat(services).containsKey("operation-service");
        assertThat(services).containsKey("admin-service");
    }

    @Test
    @DisplayName("/health/services includes all 3 BFF services (web-bff, app-bff, bo-bff)")
    void serviceHealth_includesBffServices() {
        for (int i = 0; i < 8; i++) {
            mockServer.enqueue(new MockResponse()
                    .setBody("{\"status\":\"UP\"}")
                    .addHeader("Content-Type", "application/json"));
        }

        Map<String, ServiceHealth> services = healthController.serviceHealth().block();

        assertThat(services).containsKey("web-bff");
        assertThat(services).containsKey("app-bff");
        assertThat(services).containsKey("bo-bff");
    }

    @Test
    @DisplayName("/health/services marks a service as DOWN when it fails to respond")
    void serviceHealth_marksDownOnFailure() {
        // Enqueue 7 successes and 1 failure
        for (int i = 0; i < 7; i++) {
            mockServer.enqueue(new MockResponse()
                    .setBody("{\"status\":\"UP\"}")
                    .addHeader("Content-Type", "application/json"));
        }
        // Last service returns server error
        mockServer.enqueue(new MockResponse().setResponseCode(500));

        Map<String, ServiceHealth> services = healthController.serviceHealth().block();

        assertThat(services).isNotNull();
        assertThat(services).hasSize(8);

        // At least one should be DOWN
        long downCount = services.values().stream()
                .filter(h -> "DOWN".equals(h.getStatus()))
                .count();
        assertThat(downCount).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("Each ServiceHealth entry includes url and checkedAt timestamp")
    void serviceHealth_includesMetadata() {
        for (int i = 0; i < 8; i++) {
            mockServer.enqueue(new MockResponse()
                    .setBody("{\"status\":\"UP\"}")
                    .addHeader("Content-Type", "application/json"));
        }

        Map<String, ServiceHealth> services = healthController.serviceHealth().block();

        services.values().forEach(health -> {
            assertThat(health.getUrl()).isNotBlank();
            assertThat(health.getCheckedAt()).isNotNull();
            assertThat(health.getResponseTimeMs()).isGreaterThanOrEqualTo(0);
        });
    }
}
