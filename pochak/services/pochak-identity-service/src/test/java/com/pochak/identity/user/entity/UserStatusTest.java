package com.pochak.identity.user.entity;

import com.pochak.common.event.EventPublisher;
import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.auth.dto.SignInRequest;
import com.pochak.identity.auth.dto.TokenResponse;
import com.pochak.identity.auth.service.AuthServiceImpl;
import com.pochak.identity.auth.service.JwtTokenProvider;
import com.pochak.identity.user.repository.UserAuthAccountRepository;
import com.pochak.identity.user.repository.UserRefreshTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * Tests that UserStatus enum values are handled correctly during sign-in.
 * Verifies the status-based switch in AuthServiceImpl.signIn().
 */
@ExtendWith(MockitoExtension.class)
class UserStatusTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserAuthAccountRepository authAccountRepository;

    @Mock
    private UserRefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EventPublisher eventPublisher;

    @InjectMocks
    private AuthServiceImpl authService;

    private User buildUserWithStatus(Long id, String email, User.UserStatus status) {
        return User.builder()
                .id(id)
                .email(email)
                .passwordHash("encoded_password")
                .nickname("user_" + id)
                .status(status)
                .role(User.UserRole.USER)
                .build();
    }

    private SignInRequest buildSignInRequest(String email) {
        return SignInRequest.builder()
                .email(email)
                .password("password123")
                .build();
    }

    private void stubPasswordMatch(String email, User user) {
        given(userRepository.findByEmail(email)).willReturn(Optional.of(user));
        given(passwordEncoder.matches("password123", "encoded_password")).willReturn(true);
    }

    private void stubTokenGeneration(Long userId) {
        given(jwtTokenProvider.generateAccessToken(userId, "USER")).willReturn("access-token");
        given(jwtTokenProvider.generateRefreshToken(userId)).willReturn("refresh-token");
        given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
        given(refreshTokenRepository.findByUserId(userId)).willReturn(Optional.empty());
        given(refreshTokenRepository.save(any())).willReturn(null);
    }

    // ==================== ACTIVE ====================

    @Test
    @DisplayName("ACTIVE user should login successfully")
    void activeUser_shouldLoginSuccessfully() {
        // given
        User user = buildUserWithStatus(1L, "active@pochak.com", User.UserStatus.ACTIVE);
        stubPasswordMatch("active@pochak.com", user);
        stubTokenGeneration(1L);

        // when
        TokenResponse response = authService.signIn(buildSignInRequest("active@pochak.com"));

        // then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(user.getStatus()).isEqualTo(User.UserStatus.ACTIVE);
    }

    // ==================== INACTIVE ====================

    @Test
    @DisplayName("INACTIVE user should be allowed to login")
    void inactiveUser_shouldBeAllowedToLogin() {
        // given
        User user = buildUserWithStatus(2L, "inactive@pochak.com", User.UserStatus.INACTIVE);
        stubPasswordMatch("inactive@pochak.com", user);
        stubTokenGeneration(2L);

        // when
        TokenResponse response = authService.signIn(buildSignInRequest("inactive@pochak.com"));

        // then
        assertThat(response).isNotNull();
    }

    // ==================== SUSPENDED ====================

    @Test
    @DisplayName("SUSPENDED user should be rejected with FORBIDDEN")
    void suspendedUser_shouldBeRejected() {
        // given
        User user = buildUserWithStatus(3L, "suspended@pochak.com", User.UserStatus.SUSPENDED);
        stubPasswordMatch("suspended@pochak.com", user);

        // when & then
        assertThatThrownBy(() -> authService.signIn(buildSignInRequest("suspended@pochak.com")))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException bex = (BusinessException) ex;
                    assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(bex.getMessage()).contains("suspended");
                });

        verify(jwtTokenProvider, never()).generateAccessToken(any(), any());
    }

    // ==================== WITHDRAWN ====================

    @Test
    @DisplayName("WITHDRAWN user should be rejected with FORBIDDEN")
    void withdrawnUser_shouldBeRejected() {
        // given
        User user = buildUserWithStatus(4L, "withdrawn@pochak.com", User.UserStatus.WITHDRAWN);
        stubPasswordMatch("withdrawn@pochak.com", user);

        // when & then
        assertThatThrownBy(() -> authService.signIn(buildSignInRequest("withdrawn@pochak.com")))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException bex = (BusinessException) ex;
                    assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(bex.getMessage()).contains("withdrawn");
                });

        verify(jwtTokenProvider, never()).generateAccessToken(any(), any());
    }

    // ==================== DORMANT_PENDING ====================

    @Test
    @DisplayName("DORMANT_PENDING user should be allowed to login")
    void dormantPendingUser_shouldBeAllowedToLogin() {
        // given
        User user = buildUserWithStatus(5L, "dormant-pending@pochak.com", User.UserStatus.DORMANT_PENDING);
        stubPasswordMatch("dormant-pending@pochak.com", user);
        stubTokenGeneration(5L);

        // when
        TokenResponse response = authService.signIn(buildSignInRequest("dormant-pending@pochak.com"));

        // then
        assertThat(response).isNotNull();
    }

    // ==================== DORMANT ====================

    @Test
    @DisplayName("DORMANT user should be allowed to login")
    void dormantUser_shouldBeAllowedToLogin() {
        // given
        User user = buildUserWithStatus(6L, "dormant@pochak.com", User.UserStatus.DORMANT);
        stubPasswordMatch("dormant@pochak.com", user);
        stubTokenGeneration(6L);

        // when
        TokenResponse response = authService.signIn(buildSignInRequest("dormant@pochak.com"));

        // then
        assertThat(response).isNotNull();
    }

    // ==================== UserStatus enum values ====================

    @Test
    @DisplayName("UserStatus enum should contain all expected values")
    void userStatusEnum_shouldContainAllExpectedValues() {
        User.UserStatus[] statuses = User.UserStatus.values();
        assertThat(statuses).containsExactlyInAnyOrder(
                User.UserStatus.ACTIVE,
                User.UserStatus.INACTIVE,
                User.UserStatus.SUSPENDED,
                User.UserStatus.WITHDRAWN,
                User.UserStatus.DORMANT_PENDING,
                User.UserStatus.DORMANT
        );
    }
}
