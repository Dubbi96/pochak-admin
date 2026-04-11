package com.pochak.gateway.health;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Basic unit tests for HealthController.
 */
class HealthControllerTest {

    private final HealthController healthController = new HealthController(WebClient.builder());

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

    // /health/services 는 실제 localhost 포트를 조회하므로 통합 환경 의존성이 높아
    // 단위 단계에서는 /health 기본 응답 계약만 검증한다.
}
