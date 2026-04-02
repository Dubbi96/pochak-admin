package com.pochak.identity.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for PKCE state during OAuth2 authorization flow.
 * Maps state parameter to PKCE metadata (code_challenge, platform, timestamps).
 *
 * Entries expire after 10 minutes and are cleaned up every 5 minutes.
 */
@Slf4j
@Component
public class PkceStateStore {

    private static final long TTL_MILLIS = 10 * 60 * 1000L; // 10 minutes

    private final ConcurrentHashMap<String, PkceEntry> store = new ConcurrentHashMap<>();

    /**
     * Store PKCE metadata for a given state parameter.
     */
    public void store(String state, String codeChallenge, String codeChallengeMethod, String platform) {
        store.put(state, new PkceEntry(codeChallenge, codeChallengeMethod, platform, Instant.now()));
        log.debug("[PKCE] Stored state={}, platform={}, hasPkce={}", state, platform, codeChallenge != null);
    }

    /**
     * Retrieve and remove the PKCE entry for the given state.
     * Returns null if the state is unknown or expired.
     */
    public PkceEntry consume(String state) {
        if (state == null) {
            return null;
        }
        PkceEntry entry = store.remove(state);
        if (entry == null) {
            log.debug("[PKCE] State not found: {}", state);
            return null;
        }
        if (entry.isExpired()) {
            log.warn("[PKCE] State expired: {}", state);
            return null;
        }
        return entry;
    }

    /**
     * Peek at a PKCE entry without consuming it (for validation checks).
     */
    public PkceEntry peek(String state) {
        if (state == null) {
            return null;
        }
        PkceEntry entry = store.get(state);
        if (entry != null && entry.isExpired()) {
            store.remove(state);
            return null;
        }
        return entry;
    }

    /**
     * Scheduled cleanup of expired entries.
     */
    @Scheduled(fixedRate = 300_000) // every 5 minutes
    public void cleanup() {
        int before = store.size();
        Iterator<Map.Entry<String, PkceEntry>> it = store.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue().isExpired()) {
                it.remove();
            }
        }
        int removed = before - store.size();
        if (removed > 0) {
            log.info("[PKCE] Cleaned up {} expired entries, {} remaining", removed, store.size());
        }
    }

    /**
     * Immutable PKCE entry.
     */
    public record PkceEntry(
            String codeChallenge,
            String codeChallengeMethod,
            String platform,
            Instant createdAt
    ) {
        public boolean isExpired() {
            return Instant.now().toEpochMilli() - createdAt.toEpochMilli() > TTL_MILLIS;
        }

        public boolean hasPkce() {
            return codeChallenge != null && !codeChallenge.isBlank();
        }

        public boolean isMobile() {
            return "mobile".equalsIgnoreCase(platform);
        }
    }
}
