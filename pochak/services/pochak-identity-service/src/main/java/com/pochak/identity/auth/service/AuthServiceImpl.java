package com.pochak.identity.auth.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.auth.dto.*;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserAuthAccount;
import com.pochak.identity.user.entity.UserRefreshToken;
import com.pochak.identity.user.repository.UserAuthAccountRepository;
import com.pochak.identity.user.repository.UserRefreshTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MILLIS = 15 * 60 * 1000L; // 15 minutes

    private final ConcurrentHashMap<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final UserAuthAccountRepository authAccountRepository;
    private final UserRefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public TokenResponse signUp(SignUpRequest request) {
        // Validate nickname (username) uniqueness
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Nickname already exists");
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Email already exists");
        }

        // Create User entity with hashed password
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .phoneNumber(request.getPhoneNumber())
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();

        userRepository.save(user);

        // Create UserAuthAccount for EMAIL provider
        UserAuthAccount authAccount = UserAuthAccount.builder()
                .user(user)
                .provider("EMAIL")
                .providerUserId(request.getEmail())
                .providerEmail(request.getEmail())
                .build();
        authAccountRepository.save(authAccount);

        // TODO: Create Wallet entry via REST call to wallet-service

        return generateTokenResponse(user);
    }

    @Override
    @Transactional
    public TokenResponse signIn(SignInRequest request) {
        String email = request.getEmail();

        // SEC-011: Check login failure lockout
        LoginAttempt attempt = loginAttempts.get(email);
        if (attempt != null && attempt.count >= MAX_LOGIN_ATTEMPTS) {
            if (Instant.now().toEpochMilli() - attempt.firstAttemptTime < LOCKOUT_DURATION_MILLIS) {
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "계정이 일시적으로 잠겼습니다. 15분 후 재시도해주세요.");
            }
            // Lockout expired, reset
            loginAttempts.remove(email);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    recordLoginFailure(email);
                    return new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid credentials");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            recordLoginFailure(email);
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid credentials");
        }

        // SEC-011: Reset counter on successful login
        loginAttempts.remove(email);

        // Check user status
        switch (user.getStatus()) {
            case SUSPENDED:
                throw new BusinessException(ErrorCode.FORBIDDEN, "Account is suspended");
            case WITHDRAWN:
                throw new BusinessException(ErrorCode.FORBIDDEN, "Account has been withdrawn");
            case INACTIVE:
                // Dormant/inactive account - allow login but could flag for reactivation
                break;
            case ACTIVE:
                break;
        }

        user.updateLastLogin();

        return generateTokenResponse(user);
    }

    @Override
    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        UserRefreshToken storedToken = refreshTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token not found"));

        if (!storedToken.getToken().equals(refreshToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token mismatch");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));

        return generateTokenResponse(user);
    }

    /**
     * SEC-012: This endpoint blindly trusts client-supplied provider and providerUserId
     * without server-side verification. Use OAuth2Service.processOAuthCallbackWithResult()
     * which does proper server-side code exchange instead.
     */
    @Deprecated
    @Override
    @Transactional
    public TokenResponse socialLogin(SocialLoginRequest request) {
        // TODO [SEC-012]: This endpoint is INSECURE. Client-supplied provider/providerUserId
        // are not validated against the OAuth provider. An attacker can impersonate any user
        // by sending arbitrary provider credentials. Migrate callers to the OAuth2 callback
        // flow (OAuth2Service.processOAuthCallbackWithResult()) which performs server-side
        // authorization code exchange.
        log.warn("SEC-012: socialLogin called with unverified provider={}, providerUserId={}. "
                        + "This endpoint does NOT validate tokens with the OAuth provider and should be removed. "
                        + "Use OAuth2Service.processOAuthCallbackWithResult() instead.",
                request.getProvider(), request.getProviderUserId());

        Optional<UserAuthAccount> existingAccount = authAccountRepository
                .findByProviderAndProviderUserId(request.getProvider(), request.getProviderUserId());

        User user;
        if (existingAccount.isPresent()) {
            user = existingAccount.get().getUser();
        } else {
            // Create new user for first-time social login
            user = User.builder()
                    .email(request.getProvider() + "_" + request.getProviderUserId() + "@pochak.social")
                    .nickname(request.getProvider() + "_user_" + request.getProviderUserId())
                    .status(User.UserStatus.ACTIVE)
                    .role(User.UserRole.USER)
                    .build();
            userRepository.save(user);

            UserAuthAccount newAuthAccount = UserAuthAccount.builder()
                    .user(user)
                    .provider(request.getProvider())
                    .providerUserId(request.getProviderUserId())
                    .build();
            authAccountRepository.save(newAuthAccount);
        }

        user.updateLastLogin();

        return generateTokenResponse(user);
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.findByUserId(userId)
                .ifPresent(refreshTokenRepository::delete);
    }

    @Override
    @Transactional
    public void withdraw(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));
        user.withdraw();
        refreshTokenRepository.findByUserId(userId)
                .ifPresent(refreshTokenRepository::delete);
    }

    // SEC-011: Record a failed login attempt
    private void recordLoginFailure(String email) {
        loginAttempts.compute(email, (key, existing) -> {
            if (existing == null) {
                return new LoginAttempt(1, Instant.now().toEpochMilli());
            }
            existing.count++;
            return existing;
        });
    }

    // SEC-011: Periodically clean up expired lockout entries (every 5 minutes)
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void cleanupExpiredLoginAttempts() {
        long now = Instant.now().toEpochMilli();
        loginAttempts.entrySet().removeIf(entry ->
                now - entry.getValue().firstAttemptTime >= LOCKOUT_DURATION_MILLIS);
    }

    private static class LoginAttempt {
        int count;
        long firstAttemptTime;

        LoginAttempt(int count, long firstAttemptTime) {
            this.count = count;
            this.firstAttemptTime = firstAttemptTime;
        }
    }

    private TokenResponse generateTokenResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        // Store refresh token
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
