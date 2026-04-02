package com.pochak.common.encryption;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * JPA converter that encrypts LocalDate fields using probabilistic encryption.
 * Converts LocalDate to ISO-8601 string, then encrypts for DB storage.
 * The DB column must be VARCHAR(500) to hold the encrypted value.
 */
@Converter
public class LocalDateEncryptConverter implements AttributeConverter<LocalDate, String> {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    public String convertToDatabaseColumn(LocalDate attribute) {
        if (attribute == null) {
            return null;
        }
        String isoDate = attribute.format(ISO);
        EncryptionKeyProvider kp = EncryptionBeanHolder.getKeyProvider();
        if (kp == null || !kp.isEnabled()) {
            return isoDate;
        }
        return EncryptionBeanHolder.getProbabilisticEncryptor().encrypt(isoDate);
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        EncryptionKeyProvider kp = EncryptionBeanHolder.getKeyProvider();
        if (kp == null || !kp.isEnabled()) {
            try {
                return LocalDate.parse(dbData, ISO);
            } catch (Exception e) {
                return null;
            }
        }
        try {
            String decrypted = EncryptionBeanHolder.getProbabilisticEncryptor().decrypt(dbData);
            return LocalDate.parse(decrypted, ISO);
        } catch (Exception e) {
            // Possibly reading pre-encryption plaintext data (e.g., "2000-01-15")
            try {
                return LocalDate.parse(dbData, ISO);
            } catch (Exception ignored) {
                return null;
            }
        }
    }
}
