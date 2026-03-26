package com.pochak.identity.auth.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.auth.dto.*;
import com.pochak.identity.auth.entity.EmailVerification;
import com.pochak.identity.auth.repository.EmailVerificationRepository;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserAuthAccount;
import com.pochak.identity.user.entity.UserConsent;
import com.pochak.identity.user.entity.UserRefreshToken;
import com.pochak.identity.user.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SignupService {

    private final UserRepository userRepository;
    private final UserAuthAccountRepository authAccountRepository;
    private final UserConsentRepository consentRepository;
    private final UserRefreshTokenRepository refreshTokenRepository;
    private final PhoneVerificationService phoneVerificationService;
    private final EmailVerificationRepository emailVerificationRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    /**
     * Route A: Domestic adult (14+) signup with phone verification.
     */
    @Transactional
    public TokenResponse signupDomestic(DomesticSignupRequest request) {
        // 1. Verify phone token
        String phone = phoneVerificationService.validateVerifiedToken(request.getPhoneVerifiedToken());

        // 2. Check age >= 14
        int age = Period.between(request.getBirthday(), LocalDate.now()).getYears();
        if (age < 14) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Users under 14 must use the minor signup route");
        }

        // 3. Check duplicates
        checkDuplicateLoginId(request.getLoginId());
        checkDuplicatePhone(phone);
        if (request.getEmail() != null) {
            checkDuplicateEmail(request.getEmail());
        }

        // 4. Create user
        User user = User.builder()
                .loginId(request.getLoginId())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .name(request.getName())
                .phoneNumber(phone)
                .phoneVerified(true)
                .birthDate(request.getBirthday())
                .isMinor(false)
                .nickname(request.getLoginId()) // default nickname = loginId
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();
        userRepository.save(user);

        // 5. Create auth account (LOGIN provider)
        createAuthAccount(user, "LOGIN", request.getLoginId(), request.getEmail());

        // 6. Create consents
        saveConsents(user, request.getConsents());

        // 7. Generate tokens
        log.info("Domestic signup completed: userId={}, loginId={}", user.getId(), request.getLoginId());
        return generateTokenResponse(user);
    }

    /**
     * Route B: Domestic minor (under 14) signup with guardian verification.
     */
    @Transactional
    public TokenResponse signupMinor(MinorSignupRequest request) {
        // 1. Verify minor's phone token
        String phone = phoneVerificationService.validateVerifiedToken(request.getPhoneVerifiedToken());

        // 2. Check age < 14
        int age = Period.between(request.getBirthday(), LocalDate.now()).getYears();
        if (age >= 14) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Users 14 or older should use the standard signup route");
        }

        // 3. Verify guardian exists and is valid
        User guardian = userRepository.findById(request.getGuardianUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Guardian user not found"));

        if (guardian.getIsMinor() != null && guardian.getIsMinor()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "A minor account cannot be a guardian");
        }

        // Check guardian minor count limit
        int maxMinors = guardian.getGuardianOverrideLimit() != null
                ? guardian.getGuardianOverrideLimit() : 5;
        long currentMinorCount = userRepository.countByGuardianUserId(guardian.getId());
        if (currentMinorCount >= maxMinors) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Guardian has reached the maximum number of minor accounts");
        }

        // 4. Check duplicates
        checkDuplicateLoginId(request.getLoginId());
        checkDuplicatePhone(phone);
        if (request.getEmail() != null) {
            checkDuplicateEmail(request.getEmail());
        }

        // 5. Create user with guardian info
        User user = User.builder()
                .loginId(request.getLoginId())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .name(request.getName())
                .phoneNumber(phone)
                .phoneVerified(true)
                .birthDate(request.getBirthday())
                .isMinor(true)
                .guardianUserId(guardian.getId())
                .guardianPhone(request.getGuardianPhone())
                .guardianConsentAt(LocalDateTime.now())
                .nickname(request.getLoginId())
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();
        userRepository.save(user);

        // 6. Create auth account
        createAuthAccount(user, "LOGIN", request.getLoginId(), request.getEmail());

        // 7. Create consents
        saveConsents(user, request.getConsents());

        log.info("Minor signup completed: userId={}, guardianId={}", user.getId(), guardian.getId());
        return generateTokenResponse(user);
    }

    /**
     * Route C: Social (SNS) signup with phone verification.
     */
    @Transactional
    public TokenResponse signupSocial(SocialSignupRequest request) {
        // 1. Verify phone token
        String phone = phoneVerificationService.validateVerifiedToken(request.getPhoneVerifiedToken());

        // 2. Check duplicates
        checkDuplicatePhone(phone);
        if (authAccountRepository.existsByProviderAndProviderUserId(
                request.getProvider(), request.getProviderKey())) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "This social account is already linked to an existing user");
        }

        // 3. Create user (no login_id or password for social)
        User user = User.builder()
                .name(request.getName())
                .phoneNumber(phone)
                .phoneVerified(true)
                .nickname(request.getProvider() + "_" + request.getProviderKey().substring(0,
                        Math.min(8, request.getProviderKey().length())))
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();

        // Set email if provided
        if (request.getProviderEmail() != null) {
            user = User.builder()
                    .email(request.getProviderEmail())
                    .name(request.getName())
                    .phoneNumber(phone)
                    .phoneVerified(true)
                    .nickname(request.getProvider() + "_" + request.getProviderKey().substring(0,
                            Math.min(8, request.getProviderKey().length())))
                    .status(User.UserStatus.ACTIVE)
                    .role(User.UserRole.USER)
                    .build();
        }
        userRepository.save(user);

        // 4. Create auth account (social provider)
        createAuthAccount(user, request.getProvider().toUpperCase(),
                request.getProviderKey(), request.getProviderEmail());

        // 5. Create consents
        saveConsents(user, request.getConsents());

        log.info("Social signup completed: userId={}, provider={}", user.getId(), request.getProvider());
        return generateTokenResponse(user);
    }

    /**
     * Route D: Foreign user signup with email verification (no phone).
     */
    @Transactional
    public TokenResponse signupForeign(ForeignSignupRequest request) {
        // 1. Verify email token
        EmailVerification emailVerification = emailVerificationRepository
                .findByVerifiedTokenAndIsVerifiedTrue(request.getEmailVerifiedToken())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT,
                        "Invalid or expired email verification token"));
        String verifiedEmail = emailVerification.getEmail();

        // Ensure the email matches
        if (!verifiedEmail.equalsIgnoreCase(request.getEmail())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Email does not match the verified email");
        }

        // 2. Check duplicates
        checkDuplicateLoginId(request.getLoginId());
        checkDuplicateEmail(request.getEmail());

        // 3. Create user
        User user = User.builder()
                .loginId(request.getLoginId())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .name(request.getName())
                .birthDate(request.getBirthday())
                .nationality(request.getNationality())
                .nickname(request.getLoginId())
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();
        userRepository.save(user);

        // 4. Create auth account
        createAuthAccount(user, "LOGIN", request.getLoginId(), request.getEmail());

        // 5. Create consents
        saveConsents(user, request.getConsents());

        log.info("Foreign signup completed: userId={}, loginId={}", user.getId(), request.getLoginId());
        return generateTokenResponse(user);
    }

    // ----- Duplicate check helpers -----

    private void checkDuplicateLoginId(String loginId) {
        if (loginId != null && userRepository.existsByLoginId(loginId)) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Login ID already exists");
        }
    }

    private void checkDuplicateEmail(String email) {
        if (email != null && userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Email already exists");
        }
    }

    private void checkDuplicatePhone(String phone) {
        if (phone != null && userRepository.existsByPhoneNumber(phone)) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Phone number already registered");
        }
    }

    /**
     * Public duplicate check for the check-duplicate endpoint.
     */
    public CheckDuplicateResponse checkDuplicate(String loginId, String email, String phone) {
        return CheckDuplicateResponse.builder()
                .loginIdAvailable(loginId != null ? !userRepository.existsByLoginId(loginId) : null)
                .emailAvailable(email != null ? !userRepository.existsByEmail(email) : null)
                .phoneAvailable(phone != null ? !userRepository.existsByPhoneNumber(phone) : null)
                .build();
    }

    // ----- Helpers -----

    private void createAuthAccount(User user, String provider, String providerUserId, String providerEmail) {
        UserAuthAccount authAccount = UserAuthAccount.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerUserId)
                .providerEmail(providerEmail)
                .build();
        authAccountRepository.save(authAccount);
    }

    private void saveConsents(User user, Map<String, Boolean> consents) {
        if (consents == null) return;
        consents.forEach((type, agreed) -> {
            UserConsent consent = UserConsent.builder()
                    .user(user)
                    .consentType(type)
                    .agreed(agreed)
                    .agreedAt(agreed ? LocalDateTime.now() : null)
                    .build();
            consentRepository.save(consent);
        });
    }

    private TokenResponse generateTokenResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        UserRefreshToken tokenEntity = refreshTokenRepository.findByUserId(user.getId())
                .orElse(UserRefreshToken.builder().userId(user.getId()).build());
        tokenEntity.updateToken(refreshToken);
        refreshTokenRepository.save(tokenEntity);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration() / 1000)
                .tokenType("Bearer")
                .build();
    }
}
