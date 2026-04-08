package com.pochak.identity.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Validates that PII encryption is properly configured.
 * In production, PII_MASTER_KEY must be set.
 */
@Slf4j
@Configuration
public class EncryptionConfig {

    @Value("${pochak.encryption.master-key:}")
    private String masterKey;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @PostConstruct
    void validateEncryptionConfig() {
        if (masterKey == null || masterKey.isBlank()) {
            if (isProductionProfile()) {
                throw new IllegalStateException(
                        "PII_MASTER_KEY is required in production. "
                                + "Set it to a Base64-encoded 256-bit AES key.");
            }
            log.warn("PII_MASTER_KEY is not set. PII data will be stored in PLAINTEXT. "
                    + "This is acceptable for local development only.");
        } else {
            log.info("PII encryption is enabled with envelope encryption (KEK/DEK).");
        }
    }

    private boolean isProductionProfile() {
        return activeProfile != null && (
                activeProfile.contains("prod") || activeProfile.contains("staging"));
    }
}
