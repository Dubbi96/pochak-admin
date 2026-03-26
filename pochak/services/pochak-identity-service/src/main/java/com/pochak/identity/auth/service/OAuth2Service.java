package com.pochak.identity.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.auth.dto.OAuthCallbackResult;
import com.pochak.identity.auth.dto.OAuthUserInfo;
import com.pochak.identity.auth.dto.TokenResponse;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserAuthAccount;
import com.pochak.identity.user.entity.UserRefreshToken;
import com.pochak.identity.user.repository.UserAuthAccountRepository;
import com.pochak.identity.user.repository.UserRefreshTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UserRepository userRepository;
    private final UserAuthAccountRepository authAccountRepository;
    private final UserRefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;

    // --- Kakao ---
    @Value("${oauth2.kakao.rest-api-key:}")
    private String kakaoRestApiKey;

    @Value("${oauth2.kakao.client-secret:}")
    private String kakaoClientSecret;

    @Value("${oauth2.kakao.redirect-uri:}")
    private String kakaoRedirectUri;

    // --- Google ---
    @Value("${oauth2.google.client-id:}")
    private String googleClientId;

    @Value("${oauth2.google.client-secret:}")
    private String googleClientSecret;

    @Value("${oauth2.google.redirect-uri:}")
    private String googleRedirectUri;

    // --- Naver ---
    @Value("${oauth2.naver.client-id:}")
    private String naverClientId;

    @Value("${oauth2.naver.client-secret:}")
    private String naverClientSecret;

    @Value("${oauth2.naver.redirect-uri:}")
    private String naverRedirectUri;

    /**
     * Process OAuth callback and determine the result:
     * - LOGIN: existing linked account → issue JWT
     * - LINK_EXISTING: email found but no OAuth link → ask user to link
     * - SIGNUP_REQUIRED: completely new user → redirect to signup flow
     */
    @Transactional
    public OAuthCallbackResult processOAuthCallbackWithResult(String provider, String code) {
        log.info("[OAuth] Processing callback: provider={}", provider);

        OAuthUserInfo userInfo = switch (provider.toLowerCase()) {
            case "kakao" -> processKakao(code);
            case "google" -> processGoogle(code);
            case "naver" -> processNaver(code);
            default -> throw new BusinessException(ErrorCode.INVALID_INPUT, "Unknown OAuth provider: " + provider);
        };

        log.info("[OAuth] User info obtained: provider={}, providerId={}, email={}",
                provider, userInfo.getProviderId(), userInfo.getEmail());

        String providerUpper = provider.toUpperCase();

        // 1. Check if OAuth account already linked → LOGIN
        Optional<UserAuthAccount> existingAuth = authAccountRepository
                .findByProviderAndProviderUserId(providerUpper, userInfo.getProviderId());

        if (existingAuth.isPresent()) {
            User user = existingAuth.get().getUser();
            // Update profile with latest OAuth data on each login
            enrichUserFromOAuth(user, userInfo.getName(), userInfo.getProfileImageUrl());
            user.updateLastLogin();
            log.info("[OAuth] Existing OAuth link found → LOGIN. userId={}", user.getId());
            return OAuthCallbackResult.builder()
                    .type(OAuthCallbackResult.Type.LOGIN)
                    .tokens(generateTokenResponse(user))
                    .build();
        }

        // 2. Check if email exists → LINK_EXISTING
        if (userInfo.getEmail() != null) {
            Optional<User> userByEmail = userRepository.findByEmail(userInfo.getEmail());
            if (userByEmail.isPresent()) {
                User existingUser = userByEmail.get();
                String signupToken = jwtTokenProvider.generateSignupToken(
                        providerUpper, userInfo.getProviderId(), userInfo.getEmail(),
                        userInfo.getName(), userInfo.getProfileImageUrl());
                log.info("[OAuth] Email exists, no OAuth link → LINK_EXISTING. userId={}", existingUser.getId());
                return OAuthCallbackResult.builder()
                        .type(OAuthCallbackResult.Type.LINK_EXISTING)
                        .signupToken(signupToken)
                        .provider(providerUpper)
                        .providerId(userInfo.getProviderId())
                        .email(userInfo.getEmail())
                        .name(userInfo.getName())
                        .profileImageUrl(userInfo.getProfileImageUrl())
                        .existingUserId(existingUser.getId())
                        .build();
            }
        }

        // 3. Completely new user → SIGNUP_REQUIRED
        String signupToken = jwtTokenProvider.generateSignupToken(
                providerUpper, userInfo.getProviderId(), userInfo.getEmail(),
                userInfo.getName(), userInfo.getProfileImageUrl());
        log.info("[OAuth] New user → SIGNUP_REQUIRED");
        return OAuthCallbackResult.builder()
                .type(OAuthCallbackResult.Type.SIGNUP_REQUIRED)
                .signupToken(signupToken)
                .provider(providerUpper)
                .providerId(userInfo.getProviderId())
                .email(userInfo.getEmail())
                .name(userInfo.getName())
                .profileImageUrl(userInfo.getProfileImageUrl())
                .build();
    }

    /**
     * Complete signup: create user and link OAuth account.
     * Called after the user finishes the signup flow.
     */
    @Transactional
    public TokenResponse completeOAuthSignup(String signupToken, String nickname) {
        // Decode signup token to get provider info
        var claims = jwtTokenProvider.parseSignupToken(signupToken);
        String provider = claims.get("provider", String.class);
        String providerId = claims.get("providerId", String.class);
        String email = claims.get("email", String.class);
        String providerName = claims.get("name", String.class);
        String profileImageUrl = claims.get("profileImageUrl", String.class);

        log.info("[OAuth] Completing signup: provider={}, providerId={}, email={}, name={}", provider, providerId, email, providerName);

        // Check if OAuth account already linked (prevent double-submit)
        Optional<UserAuthAccount> existingAuth = authAccountRepository
                .findByProviderAndProviderUserId(provider, providerId);
        if (existingAuth.isPresent()) {
            User user = existingAuth.get().getUser();
            log.info("[OAuth] Account already exists, returning login tokens. userId={}", user.getId());
            return generateTokenResponse(user);
        }

        // Check if email already exists → link instead of creating duplicate
        if (email != null) {
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                // Enrich profile with OAuth data if fields are empty
                enrichUserFromOAuth(user, providerName, profileImageUrl);
                UserAuthAccount authAccount = UserAuthAccount.builder()
                        .user(user)
                        .provider(provider)
                        .providerUserId(providerId)
                        .providerEmail(email)
                        .build();
                authAccountRepository.save(authAccount);
                log.info("[OAuth] Email exists, linked OAuth. userId={}", user.getId());
                return generateTokenResponse(user);
            }
        }

        // Create new user with OAuth profile data
        String fallbackName = provider.toLowerCase() + "_" + providerId;
        String userName = providerName != null ? providerName : (nickname != null ? nickname : fallbackName);
        User user = User.builder()
                .email(email != null ? email : fallbackName + "@pochak.social")
                .nickname(nickname != null ? nickname : (providerName != null ? providerName : fallbackName))
                .name(userName)
                .profileImageUrl(profileImageUrl)
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();
        userRepository.save(user);

        UserAuthAccount authAccount = UserAuthAccount.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerId)
                .providerEmail(email)
                .build();
        authAccountRepository.save(authAccount);

        log.info("[OAuth] Signup complete: userId={}", user.getId());
        return generateTokenResponse(user);
    }

    /**
     * Link OAuth to existing account.
     */
    @Transactional
    public TokenResponse linkOAuthToExisting(String signupToken) {
        var claims = jwtTokenProvider.parseSignupToken(signupToken);
        String provider = claims.get("provider", String.class);
        String providerId = claims.get("providerId", String.class);
        String email = claims.get("email", String.class);
        String providerName = claims.get("name", String.class);
        String profileImageUrl = claims.get("profileImageUrl", String.class);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found for email: " + email));

        // Enrich profile with OAuth data if fields are empty
        enrichUserFromOAuth(user, providerName, profileImageUrl);

        UserAuthAccount authAccount = UserAuthAccount.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerId)
                .providerEmail(email)
                .build();
        authAccountRepository.save(authAccount);

        user.updateLastLogin();
        log.info("[OAuth] Linked {} to existing userId={}", provider, user.getId());
        return generateTokenResponse(user);
    }

    // ──────────────────────────────────────────────
    //  Kakao
    // ──────────────────────────────────────────────

    private OAuthUserInfo processKakao(String code) {
        log.info("[Kakao] Token exchange: redirect_uri={}", kakaoRedirectUri);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoRestApiKey);
        params.add("client_secret", kakaoClientSecret);
        params.add("redirect_uri", kakaoRedirectUri);
        params.add("code", code);

        JsonNode tokenBody = exchangeToken("https://kauth.kakao.com/oauth/token", params, "Kakao");
        String accessToken = extractField(tokenBody, "access_token");

        log.info("[Kakao] Token obtained, fetching user info...");

        JsonNode body = fetchUserInfo("https://kapi.kakao.com/v2/user/me", accessToken, "Kakao");
        String providerId = String.valueOf(body.get("id").asLong());

        JsonNode kakaoAccount = body.path("kakao_account");
        String email = kakaoAccount.has("email") ? kakaoAccount.get("email").asText() : null;

        JsonNode profile = kakaoAccount.path("profile");
        String nickname = profile.has("nickname") ? profile.get("nickname").asText() : null;
        String profileImage = profile.has("profile_image_url") ? profile.get("profile_image_url").asText() : null;

        log.info("[Kakao] User: id={}, email={}, nickname={}", providerId, email, nickname);

        return OAuthUserInfo.builder()
                .providerId(providerId)
                .email(email)
                .name(nickname)
                .profileImageUrl(profileImage)
                .provider("KAKAO")
                .build();
    }

    // ──────────────────────────────────────────────
    //  Google
    // ──────────────────────────────────────────────

    private OAuthUserInfo processGoogle(String code) {
        log.info("[Google] Token exchange: redirect_uri={}", googleRedirectUri);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("redirect_uri", googleRedirectUri);
        params.add("grant_type", "authorization_code");

        JsonNode tokenBody = exchangeToken("https://oauth2.googleapis.com/token", params, "Google");
        String accessToken = extractField(tokenBody, "access_token");

        log.info("[Google] Token obtained, fetching user info...");

        JsonNode body = fetchUserInfo("https://www.googleapis.com/oauth2/v2/userinfo", accessToken, "Google");

        return OAuthUserInfo.builder()
                .providerId(body.get("id").asText())
                .email(body.has("email") ? body.get("email").asText() : null)
                .name(body.has("name") ? body.get("name").asText() : null)
                .profileImageUrl(body.has("picture") ? body.get("picture").asText() : null)
                .provider("GOOGLE")
                .build();
    }

    // ──────────────────────────────────────────────
    //  Naver
    // ──────────────────────────────────────────────

    private OAuthUserInfo processNaver(String code) {
        log.info("[Naver] Token exchange: redirect_uri={}", naverRedirectUri);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", naverClientId);
        params.add("client_secret", naverClientSecret);
        params.add("code", code);

        JsonNode tokenBody = exchangeToken("https://nid.naver.com/oauth2.0/token", params, "Naver");
        String accessToken = extractField(tokenBody, "access_token");

        log.info("[Naver] Token obtained, fetching user info...");

        JsonNode body = fetchUserInfo("https://openapi.naver.com/v1/nid/me", accessToken, "Naver");
        JsonNode responseNode = body.get("response");

        return OAuthUserInfo.builder()
                .providerId(responseNode.get("id").asText())
                .email(responseNode.has("email") ? responseNode.get("email").asText() : null)
                .name(responseNode.has("name") ? responseNode.get("name").asText() : null)
                .profileImageUrl(responseNode.has("profile_image") ? responseNode.get("profile_image").asText() : null)
                .provider("NAVER")
                .build();
    }

    // ──────────────────────────────────────────────
    //  Enrich user profile with OAuth provider data
    // ──────────────────────────────────────────────

    private void enrichUserFromOAuth(User user, String providerName, String profileImageUrl) {
        boolean updated = false;
        if (user.getProfileImageUrl() == null && profileImageUrl != null) {
            user.updateProfile(null, null, profileImageUrl);
            updated = true;
        }
        if (user.getName() == null && providerName != null) {
            user.updateProfile(providerName, null, null, null, null, null);
            updated = true;
        }
        if (updated) {
            log.info("[OAuth] Enriched profile for userId={} with OAuth data", user.getId());
        }
    }

    // ──────────────────────────────────────────────
    //  Common: Token exchange with full error logging
    // ──────────────────────────────────────────────

    private JsonNode exchangeToken(String tokenUrl, MultiValueMap<String, String> params, String provider) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, new HttpEntity<>(params, headers), JsonNode.class);
            log.info("[{}] Token exchange success: {}", provider, response.getBody());
            return response.getBody();
        } catch (HttpClientErrorException e) {
            log.error("[{}] Token exchange FAILED: status={}, body={}", provider, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    provider + " token exchange failed: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("[{}] Token exchange ERROR: {}", provider, e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    provider + " token exchange failed: " + e.getMessage());
        }
    }

    // ──────────────────────────────────────────────
    //  Common: Fetch user info with full error logging
    // ──────────────────────────────────────────────

    private JsonNode fetchUserInfo(String url, String accessToken, String provider) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);
            log.info("[{}] User info fetched successfully", provider);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            log.error("[{}] User info fetch FAILED: status={}, body={}", provider, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    provider + " user info fetch failed: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("[{}] User info fetch ERROR: {}", provider, e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    provider + " user info fetch failed: " + e.getMessage());
        }
    }

    // ──────────────────────────────────────────────
    //  Find or create user
    // ──────────────────────────────────────────────

    private User findOrCreateUser(String provider, OAuthUserInfo info) {
        String providerUpper = provider.toUpperCase();

        Optional<UserAuthAccount> existing = authAccountRepository
                .findByProviderAndProviderUserId(providerUpper, info.getProviderId());

        if (existing.isPresent()) {
            log.info("[OAuth] Existing user found for {}:{}", providerUpper, info.getProviderId());
            return existing.get().getUser();
        }

        // Check if a user with the same email already exists
        Optional<User> userByEmail = (info.getEmail() != null)
                ? userRepository.findByEmail(info.getEmail())
                : Optional.empty();

        User user = userByEmail.orElseGet(() -> {
            log.info("[OAuth] Creating new user for {}:{}", providerUpper, info.getProviderId());
            String fallbackName = providerUpper.toLowerCase() + "_" + info.getProviderId();
            User newUser = User.builder()
                    .email(info.getEmail() != null ? info.getEmail() : fallbackName + "@pochak.social")
                    .nickname(info.getName() != null ? info.getName() : fallbackName)
                    .name(info.getName() != null ? info.getName() : fallbackName)
                    .profileImageUrl(info.getProfileImageUrl())
                    .status(User.UserStatus.ACTIVE)
                    .role(User.UserRole.USER)
                    .build();
            return userRepository.save(newUser);
        });

        // Link the new auth account
        UserAuthAccount authAccount = UserAuthAccount.builder()
                .user(user)
                .provider(providerUpper)
                .providerUserId(info.getProviderId())
                .providerEmail(info.getEmail())
                .build();
        authAccountRepository.save(authAccount);

        log.info("[OAuth] Auth account linked: userId={}, provider={}", user.getId(), providerUpper);
        return user;
    }

    // ──────────────────────────────────────────────
    //  Token generation
    // ──────────────────────────────────────────────

    private TokenResponse generateTokenResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        UserRefreshToken tokenEntity = refreshTokenRepository.findByUserId(user.getId())
                .orElse(UserRefreshToken.builder().userId(user.getId()).build());
        tokenEntity.updateToken(refreshToken);
        refreshTokenRepository.save(tokenEntity);

        log.info("[OAuth] JWT issued for userId={}", user.getId());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration() / 1000)
                .tokenType("Bearer")
                .build();
    }

    private String extractField(JsonNode node, String field) {
        if (node == null || !node.has(field)) {
            log.error("[OAuth] Missing field '{}' in response: {}", field, node);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR,
                    "OAuth token exchange failed: missing '" + field + "' in response. Got: " + node);
        }
        return node.get(field).asText();
    }
}
