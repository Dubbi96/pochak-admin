package com.pochak.identity.guardian.service;

import com.pochak.identity.guardian.entity.GuardianRelationship.ConsentMethod;

/**
 * 보호자 본인 확인 검증 인터페이스.
 * 프로덕션: PASS(나이스평가정보) 또는 Kakao 인증 연동으로 교체
 * 개발/테스트: StubGuardianConsentVerifier 사용
 */
public interface GuardianConsentVerifier {

    /**
     * 동의 방법에 따른 보호자 인증 토큰을 검증합니다.
     *
     * @param method            인증 방법 (PASS, KAKAO 등)
     * @param verificationToken 보호자 인증 완료 후 발급된 토큰
     * @throws IllegalArgumentException 토큰이 유효하지 않을 때
     */
    void verify(ConsentMethod method, String verificationToken);
}
