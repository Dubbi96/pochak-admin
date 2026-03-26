package com.pochak.common.encryption;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for probabilistic PII encryption (e.g., phone, guardianPhone).
 * Each encryption produces different ciphertext.
 * Transparent passthrough when encryption is disabled.
 */
@Converter
public class ProbabilisticEncryptConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        EncryptionKeyProvider kp = EncryptionBeanHolder.getKeyProvider();
        if (kp == null || !kp.isEnabled()) {
            return attribute;
        }
        return EncryptionBeanHolder.getProbabilisticEncryptor().encrypt(attribute);
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
            return EncryptionBeanHolder.getProbabilisticEncryptor().decrypt(dbData);
        } catch (Exception e) {
            // Possibly reading pre-encryption plaintext data
            return dbData;
        }
    }
}
