package com.pochak.common.encryption;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for deterministic PII encryption (e.g., email).
 * Same plaintext always produces the same ciphertext, enabling equality search.
 * Transparent passthrough when encryption is disabled.
 */
@Converter
public class DeterministicEncryptConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        EncryptionKeyProvider kp = EncryptionBeanHolder.getKeyProvider();
        if (kp == null || !kp.isEnabled()) {
            return attribute;
        }
        return EncryptionBeanHolder.getDeterministicEncryptor().encryptWithIv(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        EncryptionKeyProvider kp = EncryptionBeanHolder.getKeyProvider();
        if (kp == null || !kp.isEnabled()) {
            return dbData;
        }
        try {
            return EncryptionBeanHolder.getDeterministicEncryptor().decryptWithIv(dbData);
        } catch (Exception e) {
            // Possibly reading pre-encryption plaintext data
            return dbData;
        }
    }
}
