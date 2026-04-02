package com.pochak.identity.auth.service;

import com.pochak.identity.auth.dto.OAuthCallbackResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for short-lived OAuth authorization codes.
 * <p>
 * After the OAuth provider callback, tokens are no longer placed in URL parameters.
 * Instead, a one-time authorization code is generated and placed in the redirect URL.
 * The client then exchanges the code for tokens via a POST request body (SEC-006).
 * <p>
 * For mobile PKCE flows (SEC-003), the code_challenge is stored alongside the result
 * and verified against the code_verifier during the token exchange.
 * <p>
 * Codes expire after 30 seconds and are single-use (removed on first exchange).
 */
@Slf4j
@Component
public class AuthCodeStore {

    private static final long TTL_SECONDS = 30;

    private record Entry(OAuthCallbackResult result, String codeChallenge, Instant expiresAt) {}

    private final ConcurrentHashMap<String, Entry> store = new ConcurrentHashMap<>();

    /**
     * Generate a cryptographically random auth code and store the OAuth result.
     * No PKCE code_challenge — used by web flows.
     *
     * @param result the OAuth callback result containing tokens or signup info
     * @return the generated authorization code (UUID v4)
     */
    public String store(OAuthCallbackResult result) {
        return store(result, null);
    }

    /**
     * Generate a cryptographically random auth code and store the OAuth result
     * along with the PKCE code_challenge for later verification.
     *
     * @param result        the OAuth callback result containing tokens or signup info
     * @param codeChallenge the PKCE code_challenge (nullable for web flows)
     * @return the generated authorization code (UUID v4)
     */
    public String store(OAuthCallbackResult result, String codeChallenge) {
        cleanup();
        String code = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(TTL_SECONDS);
        store.put(code, new Entry(result, codeChallenge, expiresAt));
        log.debug("[AuthCodeStore] Stored auth code (expires at {}, hasPkce={})", expiresAt, codeChallenge != null);
        return code;
    }

    /**
     * Exchange an authorization code for the stored OAuth result.
     * The code is removed after this call (single-use).
     *
     * @param code the authorization code
     * @return the stored ExchangeResult with OAuthCallbackResult and optional codeChallenge,
     *         or null if the code is invalid/expired
     */
    public ExchangeResult exchange(String code) {
        Entry entry = store.remove(code);
        if (entry == null) {
            log.warn("[AuthCodeStore] Auth code not found (already used or never existed)");
            return null;
        }
        if (Instant.now().isAfter(entry.expiresAt())) {
            log.warn("[AuthCodeStore] Auth code expired");
            return null;
        }
        return new ExchangeResult(entry.result(), entry.codeChallenge());
    }

    /**
     * Remove expired entries to prevent memory leaks.
     */
    private void cleanup() {
        Instant now = Instant.now();
        store.entrySet().removeIf(e -> now.isAfter(e.getValue().expiresAt()));
    }

    /**
     * Result of an auth code exchange, including the optional PKCE code_challenge
     * that must be verified against the client's code_verifier.
     */
    public record ExchangeResult(OAuthCallbackResult callbackResult, String codeChallenge) {
        public boolean requiresPkce() {
            return codeChallenge != null && !codeChallenge.isBlank();
        }
    }
}
