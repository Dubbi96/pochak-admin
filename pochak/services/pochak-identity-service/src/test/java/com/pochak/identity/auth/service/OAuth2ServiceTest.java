package com.pochak.identity.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.common.exception.BusinessException;
import com.pochak.identity.auth.dto.OAuthCallbackResult;
import com.pochak.identity.auth.dto.TokenResponse;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserAuthAccount;
import com.pochak.identity.user.entity.UserRefreshToken;
import com.pochak.identity.user.repository.UserAuthAccountRepository;
import com.pochak.identity.user.repository.UserRefreshTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OAuth2ServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserAuthAccountRepository authAccountRepository;

    @Mock
    private UserRefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OAuth2Service oAuth2Service;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User existingUser;

    @BeforeEach
    void setUp() {
        // Set OAuth config values via reflection
        ReflectionTestUtils.setField(oAuth2Service, "kakaoRestApiKey", "test-kakao-key");
        ReflectionTestUtils.setField(oAuth2Service, "kakaoClientSecret", "test-kakao-secret");
        ReflectionTestUtils.setField(oAuth2Service, "kakaoRedirectUri", "http://localhost:8080/auth/oauth2/callback/kakao");
        ReflectionTestUtils.setField(oAuth2Service, "googleClientId", "test-google-id");
        ReflectionTestUtils.setField(oAuth2Service, "googleClientSecret", "test-google-secret");
        ReflectionTestUtils.setField(oAuth2Service, "googleRedirectUri", "http://localhost:8080/auth/oauth2/callback/google");
        ReflectionTestUtils.setField(oAuth2Service, "naverClientId", "test-naver-id");
        ReflectionTestUtils.setField(oAuth2Service, "naverClientSecret", "test-naver-secret");
        ReflectionTestUtils.setField(oAuth2Service, "naverRedirectUri", "http://localhost:8080/auth/oauth2/callback/naver");

        existingUser = User.builder()
                .id(1L)
                .email("user@kakao.com")
                .phoneNumber("01012345678")
                .nickname("kakaouser")
                .name("카카오유저")
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();
    }

    // ==================== Kakao OAuth Tests ====================

    @Nested
    @DisplayName("Kakao OAuth callback processing")
    class KakaoOAuthTests {

        @Test
        @DisplayName("Existing Kakao user → LOGIN result with tokens")
        void kakaoCallback_existingUser_returnsLoginResult() throws Exception {
            // Mock Kakao token exchange
            JsonNode tokenResponse = objectMapper.readTree(
                    "{\"access_token\":\"kakao-access-token\",\"token_type\":\"bearer\"}");
            given(restTemplate.exchange(
                    eq("https://kauth.kakao.com/oauth/token"),
                    eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

            // Mock Kakao user info
            JsonNode userInfo = objectMapper.readTree(
                    "{\"id\":12345,\"kakao_account\":{\"email\":\"user@kakao.com\",\"profile\":{\"nickname\":\"카카오유저\",\"profile_image_url\":\"https://example.com/photo.jpg\"}}}");
            given(restTemplate.exchange(
                    eq("https://kapi.kakao.com/v2/user/me"),
                    eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(userInfo, HttpStatus.OK));

            // Mock existing OAuth account
            UserAuthAccount authAccount = UserAuthAccount.builder()
                    .user(existingUser)
                    .provider("KAKAO")
                    .providerUserId("12345")
                    .providerEmail("user@kakao.com")
                    .build();
            given(authAccountRepository.findByProviderAndProviderUserId("KAKAO", "12345"))
                    .willReturn(Optional.of(authAccount));

            // Mock token generation
            given(jwtTokenProvider.generateAccessToken(1L, "USER")).willReturn("jwt-access");
            given(jwtTokenProvider.generateRefreshToken(1L)).willReturn("jwt-refresh");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.empty());
            given(refreshTokenRepository.save(any())).willReturn(null);

            // Execute
            OAuthCallbackResult result = oAuth2Service.processOAuthCallbackWithResult("kakao", "auth-code");

            // Verify
            assertThat(result.getType()).isEqualTo(OAuthCallbackResult.Type.LOGIN);
            assertThat(result.getTokens()).isNotNull();
            assertThat(result.getTokens().getAccessToken()).isEqualTo("jwt-access");
            assertThat(result.getTokens().getRefreshToken()).isEqualTo("jwt-refresh");
            assertThat(result.getTokens().getTokenType()).isEqualTo("Bearer");
        }

        @Test
        @DisplayName("New Kakao user → SIGNUP_REQUIRED result with signup token")
        void kakaoCallback_newUser_returnsSignupRequired() throws Exception {
            // Mock Kakao token exchange
            JsonNode tokenResponse = objectMapper.readTree(
                    "{\"access_token\":\"kakao-access-token\"}");
            given(restTemplate.exchange(
                    eq("https://kauth.kakao.com/oauth/token"),
                    eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

            // Mock Kakao user info — new user with email
            JsonNode userInfo = objectMapper.readTree(
                    "{\"id\":99999,\"kakao_account\":{\"email\":\"newuser@kakao.com\",\"profile\":{\"nickname\":\"새유저\"}}}");
            given(restTemplate.exchange(
                    eq("https://kapi.kakao.com/v2/user/me"),
                    eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(userInfo, HttpStatus.OK));

            // No existing OAuth account or email
            given(authAccountRepository.findByProviderAndProviderUserId("KAKAO", "99999"))
                    .willReturn(Optional.empty());
            given(userRepository.findByEmail("newuser@kakao.com")).willReturn(Optional.empty());

            // Mock signup token generation
            given(jwtTokenProvider.generateSignupToken(anyString(), anyString(), anyString(), anyString(), any()))
                    .willReturn("signup-token-xyz");

            // Execute
            OAuthCallbackResult result = oAuth2Service.processOAuthCallbackWithResult("kakao", "auth-code");

            // Verify
            assertThat(result.getType()).isEqualTo(OAuthCallbackResult.Type.SIGNUP_REQUIRED);
            assertThat(result.getSignupToken()).isEqualTo("signup-token-xyz");
            assertThat(result.getProvider()).isEqualTo("KAKAO");
            assertThat(result.getEmail()).isEqualTo("newuser@kakao.com");
        }

        @Test
        @DisplayName("Kakao user with existing email → LINK_EXISTING result")
        void kakaoCallback_existingEmail_returnsLinkExisting() throws Exception {
            // Mock Kakao token exchange
            JsonNode tokenResponse = objectMapper.readTree(
                    "{\"access_token\":\"kakao-access-token\"}");
            given(restTemplate.exchange(
                    eq("https://kauth.kakao.com/oauth/token"),
                    eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

            // Mock Kakao user info — user with existing email but no OAuth link
            JsonNode userInfo = objectMapper.readTree(
                    "{\"id\":77777,\"kakao_account\":{\"email\":\"user@kakao.com\",\"profile\":{\"nickname\":\"카카오유저\"}}}");
            given(restTemplate.exchange(
                    eq("https://kapi.kakao.com/v2/user/me"),
                    eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(userInfo, HttpStatus.OK));

            // No OAuth account, but email exists
            given(authAccountRepository.findByProviderAndProviderUserId("KAKAO", "77777"))
                    .willReturn(Optional.empty());
            given(userRepository.findByEmail("user@kakao.com")).willReturn(Optional.of(existingUser));
            given(jwtTokenProvider.generateSignupToken(anyString(), anyString(), anyString(), anyString(), any()))
                    .willReturn("link-token-abc");

            // Execute
            OAuthCallbackResult result = oAuth2Service.processOAuthCallbackWithResult("kakao", "auth-code");

            // Verify
            assertThat(result.getType()).isEqualTo(OAuthCallbackResult.Type.LINK_EXISTING);
            assertThat(result.getSignupToken()).isEqualTo("link-token-abc");
            assertThat(result.getEmail()).isEqualTo("user@kakao.com");
            assertThat(result.getExistingUserId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Kakao token exchange failure → throws BusinessException")
        void kakaoCallback_tokenExchangeFails_throwsException() {
            given(restTemplate.exchange(
                    eq("https://kauth.kakao.com/oauth/token"),
                    eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                    .willThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED, "Invalid code"));

            assertThatThrownBy(() -> oAuth2Service.processOAuthCallbackWithResult("kakao", "bad-code"))
                    .isInstanceOf(BusinessException.class);
        }
    }

    // ==================== Google OAuth Tests ====================

    @Nested
    @DisplayName("Google OAuth callback processing")
    class GoogleOAuthTests {

        @Test
        @DisplayName("Existing Google user → LOGIN result with tokens")
        void googleCallback_existingUser_returnsLoginResult() throws Exception {
            // Mock Google token exchange
            JsonNode tokenResponse = objectMapper.readTree(
                    "{\"access_token\":\"google-access-token\",\"token_type\":\"Bearer\"}");
            given(restTemplate.exchange(
                    eq("https://oauth2.googleapis.com/token"),
                    eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

            // Mock Google user info
            JsonNode userInfo = objectMapper.readTree(
                    "{\"id\":\"google-123\",\"email\":\"user@gmail.com\",\"name\":\"Google User\",\"picture\":\"https://example.com/avatar.jpg\"}");
            given(restTemplate.exchange(
                    eq("https://www.googleapis.com/oauth2/v2/userinfo"),
                    eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(userInfo, HttpStatus.OK));

            // Mock existing OAuth account
            User googleUser = User.builder()
                    .id(2L)
                    .email("user@gmail.com")
                    .nickname("googleuser")
                    .status(User.UserStatus.ACTIVE)
                    .role(User.UserRole.USER)
                    .build();
            UserAuthAccount authAccount = UserAuthAccount.builder()
                    .user(googleUser)
                    .provider("GOOGLE")
                    .providerUserId("google-123")
                    .providerEmail("user@gmail.com")
                    .build();
            given(authAccountRepository.findByProviderAndProviderUserId("GOOGLE", "google-123"))
                    .willReturn(Optional.of(authAccount));

            // Mock token generation
            given(jwtTokenProvider.generateAccessToken(2L, "USER")).willReturn("google-jwt-access");
            given(jwtTokenProvider.generateRefreshToken(2L)).willReturn("google-jwt-refresh");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.findByUserId(2L)).willReturn(Optional.empty());
            given(refreshTokenRepository.save(any())).willReturn(null);

            // Execute
            OAuthCallbackResult result = oAuth2Service.processOAuthCallbackWithResult("google", "google-code");

            // Verify
            assertThat(result.getType()).isEqualTo(OAuthCallbackResult.Type.LOGIN);
            assertThat(result.getTokens().getAccessToken()).isEqualTo("google-jwt-access");
            assertThat(result.getTokens().getRefreshToken()).isEqualTo("google-jwt-refresh");
        }

        @Test
        @DisplayName("New Google user → SIGNUP_REQUIRED result")
        void googleCallback_newUser_returnsSignupRequired() throws Exception {
            // Mock Google token exchange
            JsonNode tokenResponse = objectMapper.readTree(
                    "{\"access_token\":\"google-access-token\"}");
            given(restTemplate.exchange(
                    eq("https://oauth2.googleapis.com/token"),
                    eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

            // Mock Google user info
            JsonNode userInfo = objectMapper.readTree(
                    "{\"id\":\"google-new\",\"email\":\"new@gmail.com\",\"name\":\"New User\",\"picture\":\"https://example.com/new.jpg\"}");
            given(restTemplate.exchange(
                    eq("https://www.googleapis.com/oauth2/v2/userinfo"),
                    eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)))
                    .willReturn(new ResponseEntity<>(userInfo, HttpStatus.OK));

            // No existing OAuth or email
            given(authAccountRepository.findByProviderAndProviderUserId("GOOGLE", "google-new"))
                    .willReturn(Optional.empty());
            given(userRepository.findByEmail("new@gmail.com")).willReturn(Optional.empty());
            given(jwtTokenProvider.generateSignupToken(anyString(), anyString(), anyString(), anyString(), anyString()))
                    .willReturn("google-signup-token");

            // Execute
            OAuthCallbackResult result = oAuth2Service.processOAuthCallbackWithResult("google", "google-code");

            // Verify
            assertThat(result.getType()).isEqualTo(OAuthCallbackResult.Type.SIGNUP_REQUIRED);
            assertThat(result.getProvider()).isEqualTo("GOOGLE");
            assertThat(result.getEmail()).isEqualTo("new@gmail.com");
            assertThat(result.getName()).isEqualTo("New User");
        }

        @Test
        @DisplayName("Google token exchange failure → throws BusinessException")
        void googleCallback_tokenExchangeFails_throwsException() {
            given(restTemplate.exchange(
                    eq("https://oauth2.googleapis.com/token"),
                    eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                    .willThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid grant"));

            assertThatThrownBy(() -> oAuth2Service.processOAuthCallbackWithResult("google", "bad-code"))
                    .isInstanceOf(BusinessException.class);
        }
    }

    // ==================== Unknown Provider Tests ====================

    @Test
    @DisplayName("OAuth user with same phone number → LINK_EXISTING result")
    void oauthCallback_existingPhone_returnsLinkExisting() throws Exception {
        // Mock Naver token exchange
        JsonNode tokenResponse = objectMapper.readTree(
                "{\"access_token\":\"naver-access-token\",\"token_type\":\"bearer\"}");
        given(restTemplate.exchange(
                eq("https://nid.naver.com/oauth2.0/token"),
                eq(HttpMethod.POST), any(HttpEntity.class), eq(JsonNode.class)))
                .willReturn(new ResponseEntity<>(tokenResponse, HttpStatus.OK));

        // Mock Naver user info with no email but same phone number
        JsonNode userInfo = objectMapper.readTree(
                "{\"response\":{\"id\":\"naver-123\",\"name\":\"네이버유저\",\"mobile\":\"010-1234-5678\"}}");
        given(restTemplate.exchange(
                eq("https://openapi.naver.com/v1/nid/me"),
                eq(HttpMethod.GET), any(HttpEntity.class), eq(JsonNode.class)))
                .willReturn(new ResponseEntity<>(userInfo, HttpStatus.OK));

        given(authAccountRepository.findByProviderAndProviderUserId("NAVER", "naver-123"))
                .willReturn(Optional.empty());
        given(userRepository.findByPhoneNumber("01012345678")).willReturn(Optional.of(existingUser));
        given(jwtTokenProvider.generateSignupToken(anyString(), anyString(), anyString(), anyString(), any()))
                .willReturn("phone-link-token");

        OAuthCallbackResult result = oAuth2Service.processOAuthCallbackWithResult("naver", "auth-code");

        assertThat(result.getType()).isEqualTo(OAuthCallbackResult.Type.LINK_EXISTING);
        assertThat(result.getSignupToken()).isEqualTo("phone-link-token");
        assertThat(result.getExistingUserId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("user@kakao.com");
    }

    @Test
    @DisplayName("Unknown OAuth provider → throws BusinessException")
    void unknownProvider_throwsException() {
        assertThatThrownBy(() -> oAuth2Service.processOAuthCallbackWithResult("facebook", "code"))
                .isInstanceOf(BusinessException.class);
    }

    // ==================== Complete OAuth Signup Tests ====================

    @Nested
    @DisplayName("OAuth signup completion")
    class CompleteOAuthSignupTests {

        @Test
        @DisplayName("Complete signup creates user, links OAuth, returns tokens")
        void completeSignup_newUser_createsAndReturnsTokens() {
            // Mock signup token parsing
            io.jsonwebtoken.Claims claims = org.mockito.Mockito.mock(io.jsonwebtoken.Claims.class);
            given(claims.get("provider", String.class)).willReturn("KAKAO");
            given(claims.get("providerId", String.class)).willReturn("12345");
            given(claims.get("email", String.class)).willReturn("new@pochak.com");
            given(claims.get("name", String.class)).willReturn("새유저");
            given(claims.get("profileImageUrl", String.class)).willReturn(null);

            given(jwtTokenProvider.parseSignupToken("valid-signup-token")).willReturn(claims);
            given(authAccountRepository.findByProviderAndProviderUserId("KAKAO", "12345"))
                    .willReturn(Optional.empty());
            given(userRepository.findByEmail("new@pochak.com")).willReturn(Optional.empty());

            User savedUser = User.builder()
                    .id(10L)
                    .email("new@pochak.com")
                    .nickname("myNickname")
                    .status(User.UserStatus.ACTIVE)
                    .role(User.UserRole.USER)
                    .build();
            given(userRepository.save(any(User.class))).willReturn(savedUser);
            given(authAccountRepository.save(any())).willReturn(null);
            given(jwtTokenProvider.generateAccessToken(10L, "USER")).willReturn("new-access");
            given(jwtTokenProvider.generateRefreshToken(10L)).willReturn("new-refresh");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.findByUserId(10L)).willReturn(Optional.empty());
            given(refreshTokenRepository.save(any())).willReturn(null);

            // Execute
            TokenResponse response = oAuth2Service.completeOAuthSignup("valid-signup-token", "myNickname");

            // Verify
            assertThat(response.getAccessToken()).isEqualTo("new-access");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
            verify(userRepository).save(any(User.class));
            verify(authAccountRepository).save(any(UserAuthAccount.class));
        }
    }

    // ==================== Link OAuth Tests ====================

    @Nested
    @DisplayName("Link OAuth to existing account")
    class LinkOAuthTests {

        @Test
        @DisplayName("Link OAuth to existing account returns tokens")
        void linkOAuth_existingUser_linksAndReturnsTokens() {
            io.jsonwebtoken.Claims claims = org.mockito.Mockito.mock(io.jsonwebtoken.Claims.class);
            given(claims.get("provider", String.class)).willReturn("GOOGLE");
            given(claims.get("providerId", String.class)).willReturn("google-456");
            given(claims.get("email", String.class)).willReturn("user@kakao.com");
            given(claims.get("name", String.class)).willReturn("카카오유저");
            given(claims.get("profileImageUrl", String.class)).willReturn(null);

            given(jwtTokenProvider.parseSignupToken("link-token")).willReturn(claims);
            given(userRepository.findByEmail("user@kakao.com")).willReturn(Optional.of(existingUser));
            given(authAccountRepository.save(any())).willReturn(null);
            given(jwtTokenProvider.generateAccessToken(1L, "USER")).willReturn("linked-access");
            given(jwtTokenProvider.generateRefreshToken(1L)).willReturn("linked-refresh");
            given(jwtTokenProvider.getAccessTokenExpiration()).willReturn(1800000L);
            given(refreshTokenRepository.findByUserId(1L)).willReturn(Optional.empty());
            given(refreshTokenRepository.save(any())).willReturn(null);

            // Execute
            TokenResponse response = oAuth2Service.linkOAuthToExisting("link-token");

            // Verify
            assertThat(response.getAccessToken()).isEqualTo("linked-access");
            verify(authAccountRepository).save(any(UserAuthAccount.class));
        }

        @Test
        @DisplayName("Link OAuth with non-existent email → throws BusinessException")
        void linkOAuth_noUser_throwsException() {
            io.jsonwebtoken.Claims claims = org.mockito.Mockito.mock(io.jsonwebtoken.Claims.class);
            given(claims.get("provider", String.class)).willReturn("GOOGLE");
            given(claims.get("providerId", String.class)).willReturn("google-456");
            given(claims.get("email", String.class)).willReturn("nonexistent@pochak.com");
            given(claims.get("name", String.class)).willReturn(null);
            given(claims.get("profileImageUrl", String.class)).willReturn(null);

            given(jwtTokenProvider.parseSignupToken("bad-link-token")).willReturn(claims);
            given(userRepository.findByEmail("nonexistent@pochak.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> oAuth2Service.linkOAuthToExisting("bad-link-token"))
                    .isInstanceOf(BusinessException.class);
        }
    }
}
