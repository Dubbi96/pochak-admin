package com.pochak.identity.guardian.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.identity.guardian.dto.GuardianRelationshipVerifyDto;
import com.pochak.identity.guardian.dto.GuardianRequestDto;
import com.pochak.identity.guardian.dto.GuardianResponseDto;
import com.pochak.identity.guardian.dto.PaymentLimitCheckDto;
import com.pochak.identity.guardian.dto.PaymentLimitUpdateDto;
import com.pochak.identity.guardian.service.GuardianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/guardians")
@RequiredArgsConstructor
public class GuardianController {

    private final GuardianService guardianService;

    /**
     * 보호자 연결 요청
     */
    @PostMapping("/request")
    public ApiResponse<GuardianResponseDto> requestGuardian(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody GuardianRequestDto request) {
        return ApiResponse.success(
                guardianService.requestGuardian(userId, request.getMinorId(), request.getConsentMethod()));
    }

    /**
     * 보호자 인증 완료
     */
    @PostMapping("/{id}/verify")
    public ApiResponse<GuardianResponseDto> verifyGuardian(
            @PathVariable Long id,
            @RequestParam(required = false) String verificationToken) {
        return ApiResponse.success(guardianService.verifyGuardian(id, verificationToken));
    }

    /**
     * 보호자의 미성년자 목록 조회
     */
    @GetMapping("/minors")
    public ApiResponse<List<GuardianResponseDto>> getMinors(
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(guardianService.getMinors(userId));
    }

    /**
     * 미성년자의 보호자 정보 조회
     */
    @GetMapping("/my-guardian")
    public ApiResponse<GuardianResponseDto> getMyGuardian(
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(guardianService.getGuardian(userId));
    }

    /**
     * 월간 결제 한도 업데이트
     */
    @PutMapping("/{id}/limit")
    public ApiResponse<GuardianResponseDto> updatePaymentLimit(
            @PathVariable Long id,
            @Valid @RequestBody PaymentLimitUpdateDto request) {
        return ApiResponse.success(
                guardianService.updatePaymentLimit(id, request.getMonthlyPaymentLimit()));
    }

    /**
     * 보호자 관계 해제
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> revokeGuardian(@PathVariable Long id) {
        guardianService.revokeGuardian(id);
        return ApiResponse.success(null);
    }

    /**
     * 결제 한도 확인 (commerce 서비스에서 호출)
     */
    @GetMapping("/check-limit")
    public ApiResponse<PaymentLimitCheckDto> checkPaymentLimit(
            @RequestParam Long minorId,
            @RequestParam Integer amount) {
        return ApiResponse.success(guardianService.checkPaymentLimit(minorId, amount));
    }

    /**
     * 보호자 관계 검증 (content 서비스에서 GUARDIAN 멤버십 부여 시 호출)
     * Returns verified=true if a VERIFIED guardian relationship exists for the given guardian-minor pair.
     */
    @GetMapping("/verify-relationship")
    public ApiResponse<GuardianRelationshipVerifyDto> verifyRelationship(
            @RequestParam Long guardianId,
            @RequestParam Long minorId) {
        boolean verified = guardianService.isVerifiedGuardian(guardianId, minorId);
        return ApiResponse.success(new GuardianRelationshipVerifyDto(guardianId, minorId, verified));
    }
}
