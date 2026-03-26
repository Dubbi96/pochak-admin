package com.pochak.identity.auth.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.auth.entity.PhoneVerification;
import com.pochak.identity.auth.repository.PhoneVerificationRepository;
import com.pochak.identity.user.entity.UserAuthAccount;
import com.pochak.identity.auth.service.sms.SmsService;
import com.pochak.identity.user.repository.UserAuthAccountRepository;
import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhoneVerificationService {

    private static final int MAX_ATTEMPTS_PER_CODE = 5;
    private static final int MAX_CODES_PER_HOUR = 5;
    private static final int CODE_EXPIRY_SECONDS = 180;
    private static final int CODE_LENGTH = 6;

    private final PhoneVerificationRepository phoneVerificationRepository;
    private final UserRepository userRepository;
    private final UserAuthAccountRepository authAccountRepository;
    private final SmsService smsService;

    @Transactional
    public Map<String, Object> sendVerificationCode(String phone, String purpose) {
        // Rate limiting: max 5 codes per phone per hour
        long recentCount = phoneVerificationRepository.countByPhoneAndPurposeAndCreatedAtAfter(
                phone, purpose, LocalDateTime.now().minusHours(1));
        if (recentCount >= MAX_CODES_PER_HOUR) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Too many verification requests. Please try again later.");
        }

        // Generate 6-digit code
        String code = generateCode();

        PhoneVerification verification = PhoneVerification.builder()
                .phone(phone)
                .code(code)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusSeconds(CODE_EXPIRY_SECONDS))
                .build();

        phoneVerificationRepository.save(verification);

        // Send SMS via configured provider
        smsService.sendVerificationCode(phone, code);

        Map<String, Object> result = new HashMap<>();
        result.put("sent", true);
        result.put("expiresInSeconds", CODE_EXPIRY_SECONDS);
        return result;
    }

    @Transactional
    public Map<String, Object> verifyCode(String phone, String code, String purpose) {
        PhoneVerification verification = phoneVerificationRepository
                .findTopByPhoneAndPurposeAndIsVerifiedFalseOrderByCreatedAtDesc(phone, purpose)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "No pending verification found"));

        // Check expiry
        if (verification.isExpired()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Verification code has expired");
        }

        // Check max attempts
        if (verification.getAttemptCount() >= MAX_ATTEMPTS_PER_CODE) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Too many failed attempts. Please request a new code.");
        }

        verification.incrementAttempt();

        if (!verification.getCode().equals(code)) {
            phoneVerificationRepository.save(verification);
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid verification code");
        }

        // Mark verified and generate token
        String verifiedToken = UUID.randomUUID().toString();
        verification.markVerified(verifiedToken);
        phoneVerificationRepository.save(verification);

        Map<String, Object> result = new HashMap<>();
        result.put("verified", true);
        result.put("verifiedToken", verifiedToken);
        return result;
    }

    public Map<String, Object> checkPhoneRegistration(String phone) {
        Map<String, Object> result = new HashMap<>();

        var userOpt = userRepository.findByPhoneNumber(phone);
        if (userOpt.isEmpty()) {
            result.put("registered", false);
            return result;
        }

        var user = userOpt.get();
        result.put("registered", true);
        result.put("accountType", user.getIsMinor() != null && user.getIsMinor() ? "MINOR" : "ADULT");

        // Find linked providers
        List<String> linkedProviders = authAccountRepository.findAllByUser(user)
                .stream()
                .map(UserAuthAccount::getProvider)
                .toList();
        result.put("linkedProviders", linkedProviders);

        return result;
    }

    /**
     * Validates that a verified_token is valid and returns the phone number.
     */
    public String validateVerifiedToken(String verifiedToken) {
        PhoneVerification verification = phoneVerificationRepository
                .findByVerifiedTokenAndIsVerifiedTrue(verifiedToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT, "Invalid or expired verification token"));
        return verification.getPhone();
    }

    private String generateCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6-digit
        return String.valueOf(code);
    }
}
