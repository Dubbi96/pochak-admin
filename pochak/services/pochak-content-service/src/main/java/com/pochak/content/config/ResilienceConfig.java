package com.pochak.content.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.circuitbreaker.event.CircuitBreakerOnStateTransitionEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * Registers event listeners for the commerceEntitlement circuit breaker
 * so state transitions are logged at WARN level.
 */
@Slf4j
@Configuration
public class ResilienceConfig {

    private final CircuitBreakerRegistry circuitBreakerRegistry;

    public ResilienceConfig(CircuitBreakerRegistry circuitBreakerRegistry) {
        this.circuitBreakerRegistry = circuitBreakerRegistry;
    }

    @PostConstruct
    public void registerEventListeners() {
        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("commerceEntitlement");
        cb.getEventPublisher()
                .onStateTransition(this::onStateTransition);
    }

    private void onStateTransition(CircuitBreakerOnStateTransitionEvent event) {
        log.warn("Circuit breaker [{}] state transition: {} -> {}",
                event.getCircuitBreakerName(),
                event.getStateTransition().getFromState(),
                event.getStateTransition().getToState());
    }
}
