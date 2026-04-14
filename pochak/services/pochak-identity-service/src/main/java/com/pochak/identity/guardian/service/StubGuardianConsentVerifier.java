package com.pochak.identity.guardian.service;

import com.pochak.identity.guardian.entity.GuardianRelationship.ConsentMethod;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * 개발/테스트용 보호자 인증 Stub.
 * 토큰이 null 또는 빈 문자열이 아닌지만 확인합니다.
 *
 * 프로덕션 전환 시:
 *   pochak.guardian.verifier: pass  → NicePassGuardianConsentVerifier
 *   pochak.guardian.verifier: kakao → KakaoGuardianConsentVerifier
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "pochak.guardian.verifier", havingValue = "stub", matchIfMissing = true)
public class StubGuardianConsentVerifier implements GuardianConsentVerifier {

    @Override
    public void verify(ConsentMethod method, String verificationToken) {
        if (verificationToken == null || verificationToken.isBlank()) {
            throw new IllegalArgumentException("보호자 인증 토큰이 없습니다");
        }
        log.warn("[Guardian-Stub] Verification token accepted without real {} check: token={}",
                method, verificationToken);
    }
}
