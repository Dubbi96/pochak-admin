package com.pochak.gateway.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtSecretConfig {

    private static final Logger log = LoggerFactory.getLogger(JwtSecretConfig.class);

    private static final String KNOWN_DEV_SECRET =
            "pochak-default-secret-key-for-development-only-change-in-production-env";

    private static final int MINIMUM_SECRET_LENGTH = 32;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @PostConstruct
    public void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is required but not set. "
                            + "Set JWT_SECRET to a secure random string of at least "
                            + MINIMUM_SECRET_LENGTH + " characters.");
        }

        if (jwtSecret.length() < MINIMUM_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least " + MINIMUM_SECRET_LENGTH
                            + " characters long. Current length: " + jwtSecret.length());
        }

        if (KNOWN_DEV_SECRET.equals(jwtSecret)) {
            log.warn("JWT_SECRET is set to the known development default. "
                    + "This is NOT safe for production. Change JWT_SECRET to a unique, random value.");
        }
    }
}
