package com.pochak.gateway.health;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Aggregates health status of all downstream services.
 * Each service is expected to expose Spring Boot Actuator at /actuator/health.
 */
@Slf4j
@RestController
@RequestMapping("/health")
public class HealthController {

    private final WebClient webClient;

    private static final List<ServiceDefinition> SERVICES = List.of(
            new ServiceDefinition("identity-service", "http://localhost:8081"),
            new ServiceDefinition("content-service", "http://localhost:8082"),
            new ServiceDefinition("commerce-service", "http://localhost:8083"),
            new ServiceDefinition("operation-service", "http://localhost:8084"),
            new ServiceDefinition("admin-service", "http://localhost:8085")
    );

    public HealthController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @GetMapping
    public Mono<Map<String, Object>> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("service", "pochak-gateway");
        result.put("status", "UP");
        result.put("timestamp", LocalDateTime.now().toString());
        return Mono.just(result);
    }

    @GetMapping("/services")
    public Mono<Map<String, ServiceHealth>> serviceHealth() {
        return Flux.fromIterable(SERVICES)
                .flatMap(this::checkService)
                .collectMap(ServiceHealth::getServiceName);
    }

    private Mono<ServiceHealth> checkService(ServiceDefinition service) {
        long startTime = System.currentTimeMillis();

        return webClient.get()
                .uri(service.baseUrl() + "/actuator/health")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(5))
                .map(body -> ServiceHealth.builder()
                        .serviceName(service.name())
                        .status("UP")
                        .url(service.baseUrl())
                        .responseTimeMs(System.currentTimeMillis() - startTime)
                        .checkedAt(LocalDateTime.now())
                        .build())
                .onErrorResume(ex -> {
                    log.warn("Health check failed for {}: {}", service.name(), ex.getMessage());
                    return Mono.just(ServiceHealth.builder()
                            .serviceName(service.name())
                            .status("DOWN")
                            .url(service.baseUrl())
                            .responseTimeMs(System.currentTimeMillis() - startTime)
                            .checkedAt(LocalDateTime.now())
                            .build());
                });
    }

    /**
     * Periodically logs health status of all downstream services every 60 seconds.
     * Enables operators to monitor service availability via application logs.
     */
    @Scheduled(fixedRate = 60_000)
    public void logServiceHealth() {
        Flux.fromIterable(SERVICES)
                .flatMap(this::checkService)
                .doOnNext(health -> {
                    if ("UP".equals(health.getStatus())) {
                        log.info("[HealthCheck] {} is UP ({}ms)", health.getServiceName(), health.getResponseTimeMs());
                    } else {
                        log.warn("[HealthCheck] {} is DOWN ({}ms)", health.getServiceName(), health.getResponseTimeMs());
                    }
                })
                .collectList()
                .doOnNext(results -> {
                    long upCount = results.stream().filter(h -> "UP".equals(h.getStatus())).count();
                    long totalCount = results.size();
                    log.info("[HealthCheck] Summary: {}/{} services UP at {}", upCount, totalCount, LocalDateTime.now());
                })
                .subscribe();
    }

    private record ServiceDefinition(String name, String baseUrl) {
    }
}
