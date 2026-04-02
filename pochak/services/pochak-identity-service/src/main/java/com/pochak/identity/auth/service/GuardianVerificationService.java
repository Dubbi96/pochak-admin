package com.pochak.identity.auth.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuardianVerificationService {

    private static final int DEFAULT_MAX_MINOR_ACCOUNTS = 5;

    private final PhoneVerificationService phoneVerificationService;
    private final UserRepository userRepository;

    /**
     * Verify guardian phone, check the account is an adult, check minor count limit.
     * The guardian phone must have already been verified via PhoneVerificationService.
     */
    @Transactional
    public Map<String, Object> verifyGuardian(String guardianVerifiedToken) {
        // Validate the guardian's phone verification token
        String guardianPhone = phoneVerificationService.validateVerifiedToken(guardianVerifiedToken);

        // Find guardian user by phone
        User guardian = userRepository.findByPhoneNumber(guardianPhone)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Guardian account not found. The guardian must have a registered account."));

        // Check guardian is an adult (14+)
        if (guardian.getBirthDate() != null) {
            int age = Period.between(guardian.getBirthDate(), LocalDate.now()).getYears();
            if (age < 14) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "Guardian must be at least 14 years old");
            }
        }

        // Check guardian is not a minor account themselves
        if (guardian.getIsMinor() != null && guardian.getIsMinor()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "A minor account cannot be a guardian");
        }

        // Check minor count limit
        int maxMinors = guardian.getGuardianOverrideLimit() != null
                ? guardian.getGuardianOverrideLimit()
                : DEFAULT_MAX_MINOR_ACCOUNTS;

        long currentMinorCount = userRepository.countByGuardianUserId(guardian.getId());
        if (currentMinorCount >= maxMinors) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Guardian has reached the maximum number of minor accounts (" + maxMinors + ")");
        }

        // Generate guardian verified token
        String guardianToken = UUID.randomUUID().toString();

        Map<String, Object> result = new HashMap<>();
        result.put("guardianVerifiedToken", guardianToken);
        result.put("guardianUserId", guardian.getId());
        result.put("guardianPhone", guardianPhone);

        log.info("Guardian verified: userId={}, phone={}, currentMinors={}/{}",
                guardian.getId(), guardianPhone, currentMinorCount, maxMinors);

        return result;
    }
}
