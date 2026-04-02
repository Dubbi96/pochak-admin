package com.pochak.common.encryption;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

/**
 * Deterministic encryption using AES-256-CBC with a derived fixed IV.
 * Same plaintext always produces the same ciphertext, enabling equality searches.
 *
 * The IV is derived from HMAC-SHA256(key, plaintext) truncated to 16 bytes,
 * making it a synthetic IV (SIV-like construction).
 */
@Component
public class DeterministicEncryptor {

    private static final String AES_CBC = "AES/CBC/PKCS5Padding";
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final int IV_LENGTH = 16;

    private final EncryptionKeyProvider keyProvider;

    public DeterministicEncryptor(EncryptionKeyProvider keyProvider) {
        this.keyProvider = keyProvider;
    }

    /**
     * Encrypts a plaintext string deterministically.
     * Returns Base64-encoded ciphertext.
     */
    public String encrypt(String plaintext) {
        if (plaintext == null) {
            return null;
        }
        try {
            SecretKey dek = keyProvider.getDataEncryptionKey();
            byte[] iv = deriveIv(dek, plaintext);
            Cipher cipher = Cipher.getInstance(AES_CBC);
            cipher.init(Cipher.ENCRYPT_MODE, dek, new IvParameterSpec(iv));
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Deterministic encryption failed", e);
        }
    }

    /**
     * Decrypts a deterministically encrypted Base64 string.
     * Requires the original plaintext's derived IV, so we store IV alongside ciphertext.
     */
    public String decrypt(String ciphertext) {
        if (ciphertext == null) {
            return null;
        }
        // For deterministic decryption, we need the IV which was derived from the plaintext.
        // Since we can't derive it without the plaintext, we store IV + ciphertext.
        // Re-implementing: encrypt stores IV_PREFIX + ciphertext
        throw new UnsupportedOperationException("Use encrypt/decrypt with IV prefix format");
    }

    /**
     * Encrypts plaintext and prepends the derived IV for later decryption.
     * Format: Base64(IV + ciphertext)
     */
    public String encryptWithIv(String plaintext) {
        if (plaintext == null) {
            return null;
        }
        try {
            SecretKey dek = keyProvider.getDataEncryptionKey();
            byte[] iv = deriveIv(dek, plaintext);
            Cipher cipher = Cipher.getInstance(AES_CBC);
            cipher.init(Cipher.ENCRYPT_MODE, dek, new IvParameterSpec(iv));
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            byte[] result = new byte[IV_LENGTH + encrypted.length];
            System.arraycopy(iv, 0, result, 0, IV_LENGTH);
            System.arraycopy(encrypted, 0, result, IV_LENGTH, encrypted.length);
            return Base64.getEncoder().encodeToString(result);
        } catch (Exception e) {
            throw new RuntimeException("Deterministic encryption failed", e);
        }
    }

    /**
     * Decrypts a value encrypted with encryptWithIv.
     */
    public String decryptWithIv(String encoded) {
        if (encoded == null) {
            return null;
        }
        try {
            byte[] data = Base64.getDecoder().decode(encoded);
            byte[] iv = Arrays.copyOfRange(data, 0, IV_LENGTH);
            byte[] ciphertext = Arrays.copyOfRange(data, IV_LENGTH, data.length);

            SecretKey dek = keyProvider.getDataEncryptionKey();
            Cipher cipher = Cipher.getInstance(AES_CBC);
            cipher.init(Cipher.DECRYPT_MODE, dek, new IvParameterSpec(iv));
            byte[] plainBytes = cipher.doFinal(ciphertext);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Deterministic decryption failed", e);
        }
    }

    /**
     * Encrypts plaintext for search purposes (no IV prefix, deterministic output).
     * Used to build search tokens.
     */
    public String encryptForSearch(String plaintext) {
        return encrypt(plaintext);
    }

    /**
     * Derives a deterministic IV from the key and plaintext using HMAC-SHA256.
     */
    private byte[] deriveIv(SecretKey key, String plaintext) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        mac.init(new SecretKeySpec(key.getEncoded(), HMAC_SHA256));
        byte[] hash = mac.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
        return Arrays.copyOfRange(hash, 0, IV_LENGTH);
    }
}
