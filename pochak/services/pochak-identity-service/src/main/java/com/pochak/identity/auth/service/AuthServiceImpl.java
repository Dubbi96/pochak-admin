package com.pochak.identity.auth.service;

import com.pochak.common.event.EventPublisher;
import com.pochak.common.event.UserWithdrawnEvent;
import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.auth.dto.*;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserAuthAccount;
import com.pochak.identity.user.entity.UserRefreshToken;
import com.pochak.identity.user.repository.UserAuthAccountRepository;
import com.pochak.identity.user.repository.UserRefreshTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MILLIS = 15 * 60 * 1000L;

    private final ConcurrentHashMap<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final UserAuthAccountRepository authAccountRepository;
    private final UserRefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EventPublisher eventPublisher;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    @Transactional
    public TokenResponse signUp(SignUpRequest request) {
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Nickname already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.DUPLICATE, "Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .phoneNumber(request.getPhoneNumber())
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();
        userRepository.save(user);

        UserAuthAccount authAccount = UserAuthAccount.builder()
                .user(user)
                .provider("EMAIL")
                .providerUserId(request.getEmail())
                .providerEmail(request.getEmail())
                .build();
        authAccountRepository.save(authAccount);

        return generateTokenResponse(user, UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public TokenResponse signIn(SignInRequest request) {
        String email = request.getEmail();

        LoginAttempt attempt = loginAttempts.get(email);
        if (attempt != null && attempt.count >= MAX_LOGIN_ATTEMPTS) {
            if (Instant.now().toEpochMilli() - attempt.firstAttemptTime < LOCKOUT_DURATION_MILLIS) {
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "계정이 일시적으로 잠겼습니다. 15분 후 재시도해주세요.");
            }
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

        loginAttempts.remove(email);

        switch (user.getStatus()) {
            case SUSPENDED:
                throw new BusinessException(ErrorCode.FORBIDDEN, "Account is suspended");
            case WITHDRAWN:
                throw new BusinessException(ErrorCode.FORBIDDEN, "Account has been withdrawn");
            case INACTIVE:
            case ACTIVE:
                break;
        }

        user.updateLastLogin();
        return generateTokenResponse(user, UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public TokenResponse refresh(String refreshToken) {
        Claims claims;
        try {
            claims = jwtTokenProvider.parseRefreshToken(refreshToken);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        Long userId = Long.parseLong(claims.getSubject());
        UserRefreshToken storedToken = refreshTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token not found"));

        if (!storedToken.matchesToken(refreshToken)) {
            log.warn("SEC: Refresh token reuse detected for userId={}, family={}",
                    userId, storedToken.getTokenFamily());
            storedToken.markReuseDetected();
            refreshTokenRepository.save(storedToken);
            tokenBlacklistService.blacklistByUserId(userId,
                    jwtTokenProvider.getAccessTokenExpiration() / 1000);
            refreshTokenRepository.deleteByUserId(userId);
            throw new BusinessException(ErrorCode.UNAUTHORIZED,
                    "Refresh token reuse detected. All sessions revoked.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));

        return generateTokenResponse(user, storedToken.getTokenFamily());
    }

    @Deprecated
    @Override
    @Transactional
    public TokenResponse socialLogin(SocialLoginRequest request) {
        log.warn("SEC-012: socialLogin called with unverified provider={}, providerUserId={}.",
                request.getProvider(), request.getProviderUserId());

        Optional<UserAuthAccount> existingAccount = authAccountRepository
                .findByProviderAndProviderUserId(request.getProvider(), request.getProviderUserId());

        User user;
        if (existingAccount.isPresent()) {
            user = existingAccount.get().getUser();
        } else {
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
        return generateTokenResponse(user, UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public void logout(Long userId, String accessToken) {
        if (accessToken != null) {
            try {
                Claims claims = jwtTokenProvider.parseAccessToken(accessToken);
                String jti = claims.getId();
                long remainingMs = claims.getExpiration().getTime() - System.currentTimeMillis();
                if (remainingMs > 0) {
                    tokenBlacklistService.blacklistByJti(jti, remainingMs / 1000);
                }
            } catch (Exception e) {
                log.warn("Could not blacklist access token on logout for userId={}: {}", userId, e.getMessage());
            }
        }
        refreshTokenRepository.findByUserId(userId)
                .ifPresent(refreshTokenRepository::delete);
    }

    @Override
    @Transactional
    public void withdraw(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));

        String emailHash = "withdrawn_" + sha256Hex(user.getEmail());

        user.clearPii(emailHash);
        user.withdraw();
        userRepository.save(user);

        eventPublisher.publish(new UserWithdrawnEvent(userId, emailHash, LocalDateTime.now()));

        tokenBlacklistService.blacklistByUserId(userId,
                jwtTokenProvider.getAccessTokenExpiration() / 1000);
        refreshTokenRepository.findByUserId(userId)
                .ifPresent(refreshTokenRepository::delete);

        authAccountRepository.deleteAllByUserId(userId);
        log.info("User withdrawn: userId={}", userId);
    }

    private static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    private void recordLoginFailure(String email) {
        loginAttempts.compute(email, (key, existing) -> {
            if (existing == null) {
                return new LoginAttempt(1, Instant.now().toEpochMilli());
            }
            existing.count++;
            return existing;
        });
    }

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

    private TokenResponse generateTokenResponse(User user, String tokenFamily) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        UserRefreshToken tokenEntity = refreshTokenRepository.findByUserId(user.getId())
                .orElse(UserRefreshToken.builder().userId(user.getId()).build());
        tokenEntity.updateToken(refreshToken, tokenFamily);
        refreshTokenRepository.save(tokenEntity);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration() / 1000)
                .tokenType("Bearer")
                .build();
    }
}
