package com.pochak.identity.auth.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * PKCE (Proof Key for Code Exchange) utility for RFC 7636.
 * Used to protect OAuth2 authorization code flow for mobile custom scheme redirects.
 */
public final class PkceUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private PkceUtil() {
    }

    /**
     * Generate a cryptographically random code verifier (43-128 characters, RFC 7636 Section 4.1).
     */
    public static String generateCodeVerifier() {
        byte[] bytes = new byte[32]; // produces 43-char base64url string
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Generate a code challenge using S256 method: BASE64URL(SHA256(code_verifier)).
     * RFC 7636 Section 4.2.
     */
    public static String generateCodeChallenge(String codeVerifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Verify that the code_verifier matches the stored code_challenge (S256 method).
     */
    public static boolean verifyCodeChallenge(String codeVerifier, String codeChallenge) {
        if (codeVerifier == null || codeChallenge == null) {
            return false;
        }
        return MessageDigest.isEqual(
                generateCodeChallenge(codeVerifier).getBytes(StandardCharsets.US_ASCII),
                codeChallenge.getBytes(StandardCharsets.US_ASCII)
        );
    }

    /**
     * Generate a cryptographically random state parameter.
     */
    public static String generateState() {
        byte[] bytes = new byte[16];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Validate code_challenge format: must be 43 characters, base64url-encoded.
     */
    public static boolean isValidCodeChallenge(String codeChallenge) {
        if (codeChallenge == null || codeChallenge.length() != 43) {
            return false;
        }
        return codeChallenge.matches("^[A-Za-z0-9_-]+$");
    }
}
