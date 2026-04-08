package com.pochak.identity.auth.service;

import com.pochak.common.event.EventPublisher;
import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.auth.dto.SignInRequest;
import com.pochak.identity.auth.dto.SignUpRequest;
import com.pochak.identity.auth.dto.TokenResponse;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserRefreshToken;
import com.pochak.identity.user.repository.UserAuthAccountRepository;
import com.pochak.identity.user.repository.UserRefreshTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

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

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User activeUser;
    private User suspendedUser;
    private User withdrawnUser;
    private User inactiveUser;

    @BeforeEach
    void setUp() {
        activeUser = User.builder()
                .id(1L)
                .email("test@pochak.com")
                .passwordHash("encoded_password")
                .nickname("testuser")
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();

        suspendedUser = User.builder()
                .id(2L)
                .email("suspended@pochak.com")
                .passwordHash("encoded_password")
                .nickname("suspendeduser")
                .status(User.UserStatus.SUSPENDED)
                .role(User.UserRole.USER)
                .build();

        withdrawnUser = User.builder()
                .id(3L)
                .email("withdrawn@pochak.com")
                .passwordHash("encoded_password")
                .nickname("withdrawnuser")
                .status(User.UserStatus.WITHDRAWN)
                .role(User.UserRole.USER)
                .build();

        inactiveUser = User.builder()
                .id(4L)
                .email("inactive@pochak.com")
                .passwordHash("encoded_password")
                .nickname("inactiveuser")
                .status(User.UserStatus.INACTIVE)
                .role(User.UserRole.USER)
                .build();
    }

    // ==================== signUp tests ====================

    @Nested
    @DisplayName("signUp")
    class SignUpTests {

        @Test
        @DisplayName("Should sign up successfully with valid request")
        void testSignup_success() {
            // given
            SignUpRequest request = SignUpRequest.builder()
                    .email("new@pochak.com")
                    .password("password123")
                    .nickname("newuser")
                    .build();

            given(userRepository.existsByNickname(anyString())).willReturn(false);
            given(userRepository.existsByEmail(anyString())).willReturn(false);
            given(passwordEncoder.encode(anyString())).willReturn("encoded");
            given(userRepository.save(any(User.class))).willReturn(activeUser);
            given(authAccountRepository.save(any())).willReturn(null);
            given(jwtTokenProvider.generateAccessToken(any(), any())).willReturn("access-token");
            given(jwtTokenProvider.generateRefreshToken(any())).willReturn("refresh-token");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.findByUserId(any())).willReturn(Optional.empty());
            given(refreshTokenRepository.save(any())).willReturn(null);

            // when
            TokenResponse response = authService.signUp(request);

            // then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(response.getTokenType()).isEqualTo("Bearer");
            assertThat(response.getExpiresIn()).isEqualTo(1800L);

            verify(userRepository).save(any(User.class));
            verify(authAccountRepository).save(any());
        }

        @Test
        @DisplayName("Should throw exception when signing up with duplicate nickname (username)")
        void testSignup_duplicateUsername_throwsException() {
            // given
            SignUpRequest request = SignUpRequest.builder()
                    .email("new@pochak.com")
                    .password("password123")
                    .nickname("testuser")
                    .build();

            given(userRepository.existsByNickname("testuser")).willReturn(true);

            // when & then
            assertThatThrownBy(() -> authService.signUp(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.DUPLICATE);
                        assertThat(bex.getMessage()).contains("Nickname already exists");
                    });

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when signing up with duplicate email")
        void testSignup_duplicateEmail_throwsException() {
            // given
            SignUpRequest request = SignUpRequest.builder()
                    .email("test@pochak.com")
                    .password("password123")
                    .nickname("uniqueuser")
                    .build();

            given(userRepository.existsByNickname(anyString())).willReturn(false);
            given(userRepository.existsByEmail("test@pochak.com")).willReturn(true);

            // when & then
            assertThatThrownBy(() -> authService.signUp(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.DUPLICATE);
                        assertThat(bex.getMessage()).contains("Email already exists");
                    });

            verify(userRepository, never()).save(any());
        }
    }

    // ==================== signIn tests ====================

    @Nested
    @DisplayName("signIn")
    class SignInTests {

        @Test
        @DisplayName("Should sign in successfully with valid credentials")
        void testLogin_success() {
            // given
            SignInRequest request = SignInRequest.builder()
                    .email("test@pochak.com")
                    .password("password123")
                    .build();

            given(userRepository.findByEmail("test@pochak.com")).willReturn(Optional.of(activeUser));
            given(passwordEncoder.matches("password123", "encoded_password")).willReturn(true);
            given(jwtTokenProvider.generateAccessToken(1L, "USER")).willReturn("access-token");
            given(jwtTokenProvider.generateRefreshToken(1L)).willReturn("refresh-token");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.empty());
            given(refreshTokenRepository.save(any())).willReturn(null);

            // when
            TokenResponse response = authService.signIn(request);

            // then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        }

        @Test
        @DisplayName("Should throw exception when signing in with wrong password")
        void testLogin_wrongPassword_throwsException() {
            // given
            SignInRequest request = SignInRequest.builder()
                    .email("test@pochak.com")
                    .password("wrong_password")
                    .build();

            given(userRepository.findByEmail("test@pochak.com")).willReturn(Optional.of(activeUser));
            given(passwordEncoder.matches("wrong_password", "encoded_password")).willReturn(false);

            // when & then
            assertThatThrownBy(() -> authService.signIn(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED);
                    });

            verify(jwtTokenProvider, never()).generateAccessToken(any(), any());
        }

        @Test
        @DisplayName("Should throw exception when signing in with non-existent email")
        void testLogin_userNotFound_throwsException() {
            // given
            SignInRequest request = SignInRequest.builder()
                    .email("nonexistent@pochak.com")
                    .password("password123")
                    .build();

            given(userRepository.findByEmail("nonexistent@pochak.com")).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> authService.signIn(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED);
                    });
        }

        @Test
        @DisplayName("Should throw exception when blocked (suspended) user tries to sign in")
        void testLogin_blockedUser_throwsException() {
            // given
            SignInRequest request = SignInRequest.builder()
                    .email("suspended@pochak.com")
                    .password("password123")
                    .build();

            given(userRepository.findByEmail("suspended@pochak.com")).willReturn(Optional.of(suspendedUser));
            given(passwordEncoder.matches("password123", "encoded_password")).willReturn(true);

            // when & then
            assertThatThrownBy(() -> authService.signIn(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                        assertThat(bex.getMessage()).contains("suspended");
                    });

            verify(jwtTokenProvider, never()).generateAccessToken(any(), any());
        }

        @Test
        @DisplayName("Should throw exception when withdrawn user tries to sign in")
        void testLogin_withdrawnUser_throwsException() {
            // given
            SignInRequest request = SignInRequest.builder()
                    .email("withdrawn@pochak.com")
                    .password("password123")
                    .build();

            given(userRepository.findByEmail("withdrawn@pochak.com")).willReturn(Optional.of(withdrawnUser));
            given(passwordEncoder.matches("password123", "encoded_password")).willReturn(true);

            // when & then
            assertThatThrownBy(() -> authService.signIn(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                        assertThat(bex.getMessage()).contains("withdrawn");
                    });
        }

        @Test
        @DisplayName("Should allow inactive (dormant) user to sign in")
        void testLogin_inactiveUser_allowsLogin() {
            // given
            SignInRequest request = SignInRequest.builder()
                    .email("inactive@pochak.com")
                    .password("password123")
                    .build();

            given(userRepository.findByEmail("inactive@pochak.com")).willReturn(Optional.of(inactiveUser));
            given(passwordEncoder.matches("password123", "encoded_password")).willReturn(true);
            given(jwtTokenProvider.generateAccessToken(4L, "USER")).willReturn("access-token");
            given(jwtTokenProvider.generateRefreshToken(4L)).willReturn("refresh-token");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.findByUserId(4L)).willReturn(Optional.empty());
            given(refreshTokenRepository.save(any())).willReturn(null);

            // when
            TokenResponse response = authService.signIn(request);

            // then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access-token");
        }
    }

    // ==================== refresh tests ====================

    @Nested
    @DisplayName("refresh")
    class RefreshTests {

        @Test
        @DisplayName("Should refresh token successfully with valid refresh token")
        void testRefreshToken_success() {
            // given
            String validRefreshToken = "valid-refresh-token";
            String tokenHash = UserRefreshToken.hashToken(validRefreshToken);
            String tokenFamily = "family-uuid-1";

            UserRefreshToken storedToken = UserRefreshToken.builder()
                    .id(1L)
                    .userId(1L)
                    .tokenHash(tokenHash)
                    .tokenFamily(tokenFamily)
                    .build();

            Claims refreshClaims = new DefaultClaims(Map.of(
                    "sub", "1",
                    "typ", "refresh"
            ));

            given(jwtTokenProvider.parseRefreshToken(validRefreshToken)).willReturn(refreshClaims);
            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.of(storedToken));
            given(userRepository.findById(1L)).willReturn(Optional.of(activeUser));
            given(jwtTokenProvider.generateAccessToken(1L, "USER")).willReturn("new-access-token");
            given(jwtTokenProvider.generateRefreshToken(1L)).willReturn("new-refresh-token");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.save(any())).willReturn(null);

            // when
            TokenResponse response = authService.refresh(validRefreshToken);

            // then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("new-access-token");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");
        }

        @Test
        @DisplayName("Should throw exception when refresh token is expired/invalid (parseRefreshToken fails)")
        void testRefreshToken_expired_throwsException() {
            // given
            String expiredToken = "expired-refresh-token";
            given(jwtTokenProvider.parseRefreshToken(expiredToken))
                    .willThrow(new RuntimeException("Invalid or expired token"));

            // when & then
            assertThatThrownBy(() -> authService.refresh(expiredToken))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED);
                    });

            verify(refreshTokenRepository, never()).findByUserId(anyLong());
        }

        @Test
        @DisplayName("Should detect reuse and revoke all sessions when token does not match stored hash")
        void testRefreshToken_reuseDetection_revokesAllSessions() {
            // given
            String reusedToken = "reused-refresh-token";
            String differentHash = UserRefreshToken.hashToken("different-token");
            String tokenFamily = "family-uuid-1";

            UserRefreshToken storedToken = UserRefreshToken.builder()
                    .id(1L)
                    .userId(1L)
                    .tokenHash(differentHash)
                    .tokenFamily(tokenFamily)
                    .build();

            Claims refreshClaims = new DefaultClaims(Map.of(
                    "sub", "1",
                    "typ", "refresh"
            ));

            given(jwtTokenProvider.parseRefreshToken(reusedToken)).willReturn(refreshClaims);
            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.of(storedToken));
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);

            // when & then
            assertThatThrownBy(() -> authService.refresh(reusedToken))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED);
                        assertThat(bex.getMessage()).contains("reuse detected");
                    });

            // verify reuse detection side effects
            verify(refreshTokenRepository).save(storedToken);
            verify(tokenBlacklistService).blacklistByUserId(eq(1L), eq(1800L));
            verify(refreshTokenRepository).deleteByUserId(1L);
            verify(userRepository, never()).findById(anyLong());
        }
    }

    // ==================== logout tests ====================

    @Nested
    @DisplayName("logout")
    class LogoutTests {

        @Test
        @DisplayName("Should blacklist access token jti and delete refresh token on logout")
        void testLogout_withAccessToken_blacklistsJti() {
            // given
            String accessToken = "valid-access-token";
            long futureExpiry = System.currentTimeMillis() + 900_000; // 15 min from now

            Claims accessClaims = new DefaultClaims(Map.of(
                    "sub", "1",
                    "jti", "token-jti-123",
                    "typ", "access"
            ));
            accessClaims.setExpiration(new Date(futureExpiry));

            given(jwtTokenProvider.parseAccessToken(accessToken)).willReturn(accessClaims);
            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.empty());

            // when
            authService.logout(1L, accessToken);

            // then
            verify(jwtTokenProvider).parseAccessToken(accessToken);
            verify(tokenBlacklistService).blacklistByJti(eq("token-jti-123"), anyLong());
        }

        @Test
        @DisplayName("Should still delete refresh token when accessToken is null")
        void testLogout_withoutAccessToken_deletesRefreshToken() {
            // given
            UserRefreshToken storedToken = UserRefreshToken.builder()
                    .id(1L)
                    .userId(1L)
                    .tokenHash("some-hash")
                    .tokenFamily("some-family")
                    .build();

            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.of(storedToken));

            // when
            authService.logout(1L, null);

            // then
            verify(jwtTokenProvider, never()).parseAccessToken(any());
            verify(tokenBlacklistService, never()).blacklistByJti(any(), anyLong());
            verify(refreshTokenRepository).delete(storedToken);
        }

        @Test
        @DisplayName("Should not throw when parseAccessToken fails (e.g. expired token)")
        void testLogout_parseAccessTokenFails_shouldNotThrow() {
            // given
            String badToken = "bad-access-token";
            given(jwtTokenProvider.parseAccessToken(badToken))
                    .willThrow(new RuntimeException("Token expired"));
            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.empty());

            // when - should not throw
            authService.logout(1L, badToken);

            // then
            verify(tokenBlacklistService, never()).blacklistByJti(any(), anyLong());
        }
    }
}
