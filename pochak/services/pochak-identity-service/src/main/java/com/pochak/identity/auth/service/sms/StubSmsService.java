package com.pochak.identity.auth.service.sms;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@ConditionalOnProperty(name = "pochak.sms.provider", havingValue = "stub", matchIfMissing = true)
public class StubSmsService implements SmsService {

    @PostConstruct
    public void init() {
        log.warn("========================================================");
        log.warn("  SMS PROVIDER: STUB");
        log.warn("  SMS messages will be logged to console only.");
        log.warn("  Set pochak.sms.provider to a real provider for production.");
        log.warn("========================================================");
    }

    @Override
    public void sendVerificationCode(String phoneNumber, String code) {
        log.info("[STUB SMS] Sending code {} to {}", code, phoneNumber);
    }
}
