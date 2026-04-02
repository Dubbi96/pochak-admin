package com.pochak.common.encryption;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Envelope encryption key provider.
 * KEK (Key Encryption Key) comes from environment variable.
 * DEK (Data Encryption Key) is generated once and stored encrypted by KEK.
 */
@Component
public class EncryptionKeyProvider {

    private static final Logger log = LoggerFactory.getLogger(EncryptionKeyProvider.class);
    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final int DEK_LENGTH = 256;

    private final String masterKeyBase64;
    private final Path dekFilePath;
    private volatile SecretKey cachedDek;
    private final Object lock = new Object();

    public EncryptionKeyProvider(
            @Value("${pochak.encryption.master-key:}") String masterKeyBase64,
            @Value("${pochak.encryption.dek-file:./pii-dek.enc}") String dekFile) {
        this.masterKeyBase64 = masterKeyBase64;
        this.dekFilePath = Path.of(dekFile);

        if (masterKeyBase64 == null || masterKeyBase64.isBlank()) {
            log.warn("PII_MASTER_KEY is not set. PII encryption is DISABLED — values stored as plaintext.");
        } else {
            log.info("PII encryption is ENABLED.");
        }
    }

    /**
     * Returns true if encryption is enabled (master key is configured).
     */
    public boolean isEnabled() {
        return masterKeyBase64 != null && !masterKeyBase64.isBlank();
    }

    /**
     * Returns the DEK for data encryption/decryption.
     * Generates and persists a new DEK if none exists.
     */
    public SecretKey getDataEncryptionKey() {
        if (!isEnabled()) {
            throw new IllegalStateException("Encryption is not enabled. Check PII_MASTER_KEY.");
        }

        SecretKey dek = cachedDek;
        if (dek != null) {
            return dek;
        }

        synchronized (lock) {
            if (cachedDek != null) {
                return cachedDek;
            }

            try {
                if (Files.exists(dekFilePath)) {
                    cachedDek = loadDek();
                } else {
                    cachedDek = generateAndStoreDek();
                }
                return cachedDek;
            } catch (Exception e) {
                throw new RuntimeException("Failed to initialize DEK", e);
            }
        }
    }

    /**
     * Rotates the KEK by re-encrypting the current DEK with the new KEK.
     * The actual data does not need re-encryption because the DEK stays the same.
     */
    public void rotateKek(String newKekBase64) {
        synchronized (lock) {
            try {
                SecretKey dek = getDataEncryptionKey();
                SecretKey newKek = decodeKey(newKekBase64);
                byte[] encryptedDek = encryptDek(dek, newKek);
                Files.write(dekFilePath, Base64.getEncoder().encode(encryptedDek));
                log.info("KEK rotated successfully. DEK re-encrypted with new KEK.");
            } catch (Exception e) {
                throw new RuntimeException("KEK rotation failed", e);
            }
        }
    }

    private SecretKey generateAndStoreDek() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(DEK_LENGTH, new SecureRandom());
        SecretKey dek = keyGen.generateKey();

        SecretKey kek = getKek();
        byte[] encryptedDek = encryptDek(dek, kek);
        Files.createDirectories(dekFilePath.getParent() != null ? dekFilePath.getParent() : Path.of("."));
        Files.write(dekFilePath, Base64.getEncoder().encode(encryptedDek));
        log.info("Generated new DEK and stored encrypted at {}", dekFilePath);
        return dek;
    }

    private SecretKey loadDek() throws Exception {
        byte[] encoded = Files.readAllBytes(dekFilePath);
        byte[] encryptedDek = Base64.getDecoder().decode(encoded);
        SecretKey kek = getKek();
        return decryptDek(encryptedDek, kek);
    }

    private SecretKey getKek() {
        return decodeKey(masterKeyBase64);
    }

    private SecretKey decodeKey(String base64Key) {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("Key must be 256 bits (32 bytes), got " + keyBytes.length);
        }
        return new SecretKeySpec(keyBytes, "AES");
    }

    private byte[] encryptDek(SecretKey dek, SecretKey kek) throws Exception {
        Cipher cipher = Cipher.getInstance(AES_GCM);
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);
        cipher.init(Cipher.ENCRYPT_MODE, kek, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
        byte[] encrypted = cipher.doFinal(dek.getEncoded());

        // IV + encrypted(DEK + GCM tag)
        byte[] result = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(encrypted, 0, result, iv.length, encrypted.length);
        return result;
    }

    private SecretKey decryptDek(byte[] encryptedDek, SecretKey kek) throws Exception {
        byte[] iv = new byte[GCM_IV_LENGTH];
        System.arraycopy(encryptedDek, 0, iv, 0, GCM_IV_LENGTH);
        byte[] ciphertext = new byte[encryptedDek.length - GCM_IV_LENGTH];
        System.arraycopy(encryptedDek, GCM_IV_LENGTH, ciphertext, 0, ciphertext.length);

        Cipher cipher = Cipher.getInstance(AES_GCM);
        cipher.init(Cipher.DECRYPT_MODE, kek, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
        byte[] dekBytes = cipher.doFinal(ciphertext);
        return new SecretKeySpec(dekBytes, "AES");
    }
}
