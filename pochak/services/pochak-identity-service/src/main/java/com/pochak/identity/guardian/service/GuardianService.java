package com.pochak.identity.guardian.service;

import com.pochak.identity.guardian.dto.GuardianResponseDto;
import com.pochak.identity.guardian.dto.PaymentLimitCheckDto;
import com.pochak.identity.guardian.entity.GuardianRelationship;
import com.pochak.identity.guardian.entity.GuardianRelationship.ConsentMethod;
import com.pochak.identity.guardian.entity.GuardianRelationship.GuardianStatus;
import com.pochak.identity.guardian.repository.GuardianRelationshipRepository;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.User.UserRole;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuardianService {

    private final GuardianRelationshipRepository guardianRepository;
    private final EntityManager entityManager;

    /**
     * 보호자 연결 요청 (PENDING 상태로 생성)
     */
    @Transactional
    public GuardianResponseDto requestGuardian(Long guardianId, Long minorId, ConsentMethod method) {
        // 이미 활성 관계가 있는지 확인
        if (guardianRepository.existsByGuardianIdAndMinorIdAndStatusNot(
                guardianId, minorId, GuardianStatus.REVOKED)) {
            throw new IllegalStateException("이미 보호자 관계가 존재합니다");
        }

        // 미성년자 확인
        User minor = entityManager.find(User.class, minorId);
        if (minor == null) {
            throw new IllegalArgumentException("미성년자 사용자를 찾을 수 없습니다: " + minorId);
        }
        if (!isMinorByAge(minor.getBirthDate())) {
            throw new IllegalStateException("해당 사용자는 미성년자가 아닙니다");
        }

        GuardianRelationship relationship = GuardianRelationship.builder()
                .guardianId(guardianId)
                .minorId(minorId)
                .consentMethod(method)
                .build();

        GuardianRelationship saved = guardianRepository.save(relationship);
        log.info("보호자 연결 요청 생성: guardian={}, minor={}, method={}", guardianId, minorId, method);

        return GuardianResponseDto.from(saved);
    }

    /**
     * 보호자 인증 완료 (PASS/Kakao 등 인증 후 호출)
     */
    @Transactional
    public GuardianResponseDto verifyGuardian(Long relationshipId, String verificationToken) {
        GuardianRelationship relationship = guardianRepository.findById(relationshipId)
                .orElseThrow(() -> new IllegalArgumentException("보호자 관계를 찾을 수 없습니다: " + relationshipId));

        if (relationship.getStatus() != GuardianStatus.PENDING) {
            throw new IllegalStateException("PENDING 상태의 관계만 인증할 수 있습니다");
        }

        // TODO: 실제 PASS/Kakao 인증 검증 로직 (interface for now)
        // verificationService.verify(relationship.getConsentMethod(), verificationToken);

        relationship.verify();

        // 미성년자의 isMinor 플래그 업데이트
        User minor = entityManager.find(User.class, relationship.getMinorId());
        if (minor != null) {
            minor.updateRole(UserRole.USER); // 보호자 인증 완료 후에도 USER 역할 유지
        }

        log.info("보호자 인증 완료: relationshipId={}", relationshipId);
        return GuardianResponseDto.from(relationship);
    }

    /**
     * 보호자의 미성년자 목록 조회
     */
    public List<GuardianResponseDto> getMinors(Long guardianId) {
        return guardianRepository.findByGuardianIdAndStatusNot(guardianId, GuardianStatus.REVOKED)
                .stream()
                .map(GuardianResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 미성년자의 보호자 정보 조회
     */
    public GuardianResponseDto getGuardian(Long minorId) {
        return guardianRepository
                .findByMinorIdAndStatus(minorId, GuardianStatus.VERIFIED)
                .map(GuardianResponseDto::from)
                .orElse(null);
    }

    /**
     * 월간 결제 한도 업데이트
     */
    @Transactional
    public GuardianResponseDto updatePaymentLimit(Long relationshipId, Integer limit) {
        GuardianRelationship relationship = guardianRepository.findById(relationshipId)
                .orElseThrow(() -> new IllegalArgumentException("보호자 관계를 찾을 수 없습니다: " + relationshipId));

        if (relationship.getStatus() != GuardianStatus.VERIFIED) {
            throw new IllegalStateException("인증된 관계에서만 결제 한도를 설정할 수 있습니다");
        }

        relationship.updatePaymentLimit(limit);
        log.info("결제 한도 업데이트: relationshipId={}, limit={}", relationshipId, limit);

        return GuardianResponseDto.from(relationship);
    }

    /**
     * 보호자 관계 해제
     */
    @Transactional
    public void revokeGuardian(Long relationshipId) {
        GuardianRelationship relationship = guardianRepository.findById(relationshipId)
                .orElseThrow(() -> new IllegalArgumentException("보호자 관계를 찾을 수 없습니다: " + relationshipId));

        relationship.revoke();
        log.info("보호자 관계 해제: relationshipId={}", relationshipId);
    }

    /**
     * 결제 한도 확인 (commerce 서비스에서 호출)
     */
    public PaymentLimitCheckDto checkPaymentLimit(Long minorId, Integer amount) {
        GuardianRelationship relationship = guardianRepository
                .findByMinorIdAndStatus(minorId, GuardianStatus.VERIFIED)
                .orElse(null);

        if (relationship == null) {
            return PaymentLimitCheckDto.builder()
                    .minorId(minorId)
                    .requestedAmount(amount)
                    .monthlyPaymentLimit(0)
                    .allowed(false)
                    .build();
        }

        boolean allowed = relationship.getMonthlyPaymentLimit() >= amount;

        return PaymentLimitCheckDto.builder()
                .minorId(minorId)
                .requestedAmount(amount)
                .monthlyPaymentLimit(relationship.getMonthlyPaymentLimit())
                .allowed(allowed)
                .build();
    }

    /**
     * 보호자-미성년자 관계가 VERIFIED 상태인지 확인 (inter-service call용)
     */
    public boolean isVerifiedGuardian(Long guardianId, Long minorId) {
        return guardianRepository.findByGuardianIdAndMinorId(guardianId, minorId)
                .map(r -> r.getStatus() == GuardianStatus.VERIFIED)
                .orElse(false);
    }

    /**
     * 14세 미만 여부 확인
     */
    public boolean isMinorByAge(LocalDate birthDate) {
        if (birthDate == null) return false;
        return Period.between(birthDate, LocalDate.now()).getYears() < 14;
    }
}
