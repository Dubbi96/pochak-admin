package com.pochak.admin.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
public class AdminSms2faService {

    private static final int CODE_LENGTH = 4;
    private static final int MAX_ATTEMPTS = 5;
    private static final long SESSION_TTL_SECONDS = 300; // 5 minutes

    private final Map<String, PendingSession> sessions = new ConcurrentHashMap<>();

    public String createSession(Long adminUserId, String phone) {
        String timeKey = UUID.randomUUID().toString();
        String code = generateCode();

        PendingSession session = new PendingSession(
                adminUserId,
                code,
                Instant.now().plusSeconds(SESSION_TTL_SECONDS),
                0
        );
        sessions.put(timeKey, session);

        // SMS stub: log the code instead of actually sending
        String maskedPhone = maskPhone(phone);
        log.info("[2FA-STUB] SMS code={} sent to {} (adminUserId={})", code, maskedPhone, adminUserId);

        return timeKey;
    }

    public Long verifyCode(String timeKey, String code) {
        PendingSession session = sessions.get(timeKey);
        if (session == null) {
            throw new IllegalArgumentException("Invalid or expired 2FA session");
        }

        if (Instant.now().isAfter(session.expiresAt)) {
            sessions.remove(timeKey);
            throw new IllegalStateException("2FA session has expired");
        }

        if (session.attempts >= MAX_ATTEMPTS) {
            sessions.remove(timeKey);
            throw new IllegalStateException("Too many failed 2FA attempts");
        }

        if (!session.code.equals(code)) {
            session.attempts++;
            throw new IllegalArgumentException("Invalid 2FA code");
        }

        // Success: remove session and return the admin user ID
        sessions.remove(timeKey);
        return session.adminUserId;
    }

    @Scheduled(fixedRate = 300_000) // every 5 minutes
    public void cleanupExpiredSessions() {
        Instant now = Instant.now();
        int before = sessions.size();
        sessions.entrySet().removeIf(e -> now.isAfter(e.getValue().expiresAt));
        int removed = before - sessions.size();
        if (removed > 0) {
            log.info("[2FA] Cleaned up {} expired sessions", removed);
        }
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return "****";
        }
        return "*".repeat(phone.length() - 4) + phone.substring(phone.length() - 4);
    }

    private String generateCode() {
        int bound = (int) Math.pow(10, CODE_LENGTH);
        int code = ThreadLocalRandom.current().nextInt(bound);
        return String.format("%0" + CODE_LENGTH + "d", code);
    }

    private static class PendingSession {
        final Long adminUserId;
        final String code;
        final Instant expiresAt;
        int attempts;

        PendingSession(Long adminUserId, String code, Instant expiresAt, int attempts) {
            this.adminUserId = adminUserId;
            this.code = code;
            this.expiresAt = expiresAt;
            this.attempts = attempts;
        }
    }
}
