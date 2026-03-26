package com.pochak.gateway.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Value("${pochak.cors.allowed-origins}")
    private String allowedOriginsRaw;

    @PostConstruct
    public void validateCorsConfig() {
        List<String> origins = parseOrigins(allowedOriginsRaw);
        if (origins.contains("*")) {
            log.warn("CORS allowed-origins contains '*'. This is insecure for production with credentials=true. "
                    + "Set CORS_ALLOWED_ORIGINS to specific origins.");
        }
        log.info("CORS allowed origin patterns: {}", origins);
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        List<String> origins = parseOrigins(allowedOriginsRaw);

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }

    private List<String> parseOrigins(String raw) {
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
