package com.pochak.identity.auth.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.identity.auth.dto.AuthCodeExchangeRequest;
import com.pochak.identity.auth.dto.OAuthCallbackResult;
import com.pochak.identity.auth.dto.TokenResponse;
import com.pochak.identity.auth.service.AuthCodeStore;
import com.pochak.identity.auth.service.AuthCodeStore.ExchangeResult;
import com.pochak.identity.auth.service.OAuth2Service;
import com.pochak.identity.auth.service.PkceStateStore;
import com.pochak.identity.auth.service.PkceStateStore.PkceEntry;
import com.pochak.identity.auth.util.PkceUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final OAuth2Service oAuth2Service;
    private final AuthCodeStore authCodeStore;
    private final PkceStateStore pkceStateStore;

    @Value("${app.web-base-url:http://localhost:3100}")
    private String webBaseUrl;

    @Value("${oauth2.kakao.rest-api-key:}")
    private String kakaoRestApiKey;

    @Value("${oauth2.kakao.redirect-uri:}")
    private String kakaoRedirectUri;

    @Value("${oauth2.google.client-id:}")
    private String googleClientId;

    @Value("${oauth2.google.redirect-uri:}")
    private String googleRedirectUri;

    @Value("${oauth2.naver.client-id:}")
    private String naverClientId;

    @Value("${oauth2.naver.redirect-uri:}")
    private String naverRedirectUri;

    // ──────────────────────────────────────────────
    //  SEC-003: Initiate OAuth with PKCE
    // ──────────────────────────────────────────────

    /**
     * Initiate OAuth2 authorization with optional PKCE support.
     *
     * Mobile apps MUST send code_challenge (S256). Web clients may omit it.
     * This endpoint generates a state parameter, stores PKCE metadata, and
     * redirects to the OAuth provider's authorization page.
     *
     * @param provider             kakao, google, naver
     * @param codeChallenge        PKCE code_challenge (required for mobile)
     * @param codeChallengeMethod  S256 (only supported method)
     * @param platform             "mobile" or "web" (default: mobile)
     */
    @GetMapping("/authorize/{provider}")
    public void initiateOAuth(
            @PathVariable String provider,
            @RequestParam(name = "code_challenge", required = false) String codeChallenge,
            @RequestParam(name = "code_challenge_method", required = false, defaultValue = "S256") String codeChallengeMethod,
            @RequestParam(required = false, defaultValue = "mobile") String platform,
            HttpServletResponse response) throws IOException {

        // Validate PKCE for mobile
        if ("mobile".equalsIgnoreCase(platform)) {
            if (codeChallenge == null || codeChallenge.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "code_challenge is required for mobile platform (PKCE)");
            }
            if (!"S256".equalsIgnoreCase(codeChallengeMethod)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Only S256 code_challenge_method is supported");
            }
            if (!PkceUtil.isValidCodeChallenge(codeChallenge)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid code_challenge format. Must be 43-char base64url string.");
            }
        }

        // Generate state parameter and store PKCE data
        String state = PkceUtil.generateState();
        pkceStateStore.store(state, codeChallenge, codeChallengeMethod, platform);

        // Build provider authorization URL
        String authorizationUrl = buildAuthorizationUrl(provider.toLowerCase(), state);
        log.info("[OAuth/PKCE] Initiating: provider={}, platform={}, hasPkce={}, state={}",
                provider, platform, codeChallenge != null, state);

        response.sendRedirect(authorizationUrl);
    }

    // ──────────────────────────────────────────────
    //  OAuth callback (SEC-006 + SEC-003 PKCE)
    // ──────────────────────────────────────────────

    /**
     * OAuth2 callback handler.
     *
     * SEC-006: Tokens are no longer placed in redirect URL parameters.
     * Instead, a one-time authorization code is generated and the client
     * exchanges it for tokens via POST /auth/oauth2/token.
     *
     * SEC-003: For PKCE mobile flows (state found in PkceStateStore with code_challenge),
     * the code_challenge is stored alongside the auth code. The mobile app must provide
     * the matching code_verifier when exchanging the auth code for tokens.
     *
     * Flow:
     * 1. LOGIN -> redirect with code={authCode}
     * 2. SIGNUP_REQUIRED -> redirect with signupToken=...&provider=...&email=...
     * 3. LINK_EXISTING -> redirect with signupToken=...&provider=...&email=...
     */
    @GetMapping("/callback/{provider}")
    public void oauthCallback(
            @PathVariable String provider,
            @RequestParam String code,
            @RequestParam(required = false) String state,
            HttpServletResponse response) throws IOException {

        log.info("OAuth2 callback received: provider={}, state={}", provider, state);

        // Prevent browser caching of OAuth redirects (fixes 304 Not Modified)
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        OAuthCallbackResult result = oAuth2Service.processOAuthCallbackWithResult(provider, code);

        // Try to consume PKCE state (only for PKCE-initiated flows with generated state)
        // Legacy flows use state=web or state=mobile (plain strings), which won't be in PkceStateStore
        PkceEntry pkceEntry = null;
        if (state != null && !"web".equals(state) && !"mobile".equals(state)) {
            pkceEntry = pkceStateStore.consume(state);
        }

        boolean isWeb = "web".equals(state) || (pkceEntry != null && !pkceEntry.isMobile());

        // Extract code_challenge from PKCE entry (if present) for storing with auth code
        String codeChallenge = (pkceEntry != null && pkceEntry.hasPkce()) ? pkceEntry.codeChallenge() : null;

        switch (result.getType()) {
            case LOGIN -> {
                // SEC-006: Store tokens behind a one-time auth code instead of URL params
                // SEC-003: If PKCE, also store code_challenge for verification at token exchange
                String authCode = authCodeStore.store(result, codeChallenge);
                String redirectUrl = isWeb
                        ? String.format("%s/auth/callback?code=%s", webBaseUrl, authCode)
                        : String.format("pochak://auth?code=%s", authCode);
                log.info("[OAuth] LOGIN -> redirecting with auth code (tokens not in URL, pkce={})", codeChallenge != null);
                response.sendRedirect(redirectUrl);
            }
            case SIGNUP_REQUIRED -> {
                // signupToken is a short-lived, limited-scope token -- acceptable in URL
                String encodedToken = URLEncoder.encode(result.getSignupToken(), StandardCharsets.UTF_8);
                String encodedProvider = URLEncoder.encode(result.getProvider(), StandardCharsets.UTF_8);
                String encodedEmail = result.getEmail() != null ? URLEncoder.encode(result.getEmail(), StandardCharsets.UTF_8) : "";
                String encodedName = result.getName() != null ? URLEncoder.encode(result.getName(), StandardCharsets.UTF_8) : "";
                String encodedProfileImage = result.getProfileImageUrl() != null ? URLEncoder.encode(result.getProfileImageUrl(), StandardCharsets.UTF_8) : "";
                String redirectUrl = isWeb
                        ? String.format("%s/signup?signupToken=%s&provider=%s&email=%s&name=%s&profileImageUrl=%s",
                            webBaseUrl, encodedToken, encodedProvider, encodedEmail, encodedName, encodedProfileImage)
                        : String.format("pochak://signup?signupToken=%s&provider=%s&email=%s&name=%s&profileImageUrl=%s",
                            encodedToken, encodedProvider, encodedEmail, encodedName, encodedProfileImage);
                log.info("[OAuth] SIGNUP_REQUIRED -> redirecting to signup");
                response.sendRedirect(redirectUrl);
            }
            case LINK_EXISTING -> {
                String encodedToken = URLEncoder.encode(result.getSignupToken(), StandardCharsets.UTF_8);
                String encodedProvider = URLEncoder.encode(result.getProvider(), StandardCharsets.UTF_8);
                String encodedEmail = URLEncoder.encode(result.getEmail(), StandardCharsets.UTF_8);
                String redirectUrl = isWeb
                        ? String.format("%s/auth/link?signupToken=%s&provider=%s&email=%s",
                            webBaseUrl, encodedToken, encodedProvider, encodedEmail)
                        : String.format("pochak://auth/link?signupToken=%s&provider=%s&email=%s",
                            encodedToken, encodedProvider, encodedEmail);
                log.info("[OAuth] LINK_EXISTING -> redirecting to link page");
                response.sendRedirect(redirectUrl);
            }
        }
    }

    // ──────────────────────────────────────────────
    //  Token exchange (SEC-006 + SEC-003 PKCE)
    // ──────────────────────────────────────────────

    /**
     * Exchange a one-time authorization code for tokens.
     *
     * SEC-006: The auth code was issued during the OAuth callback redirect.
     * It expires after 30 seconds and can only be used once.
     *
     * SEC-003: If the auth code was issued during a PKCE flow, the code_verifier
     * is REQUIRED and must match the code_challenge stored during authorization.
     * This prevents authorization code interception attacks on mobile custom schemes.
     *
     * @param request contains the auth code and optional PKCE codeVerifier
     * @return TokenResponse with accessToken, refreshToken, expiresIn, tokenType
     */
    @PostMapping("/token")
    public ApiResponse<TokenResponse> exchangeAuthCode(@RequestBody AuthCodeExchangeRequest request) {
        log.info("[OAuth] Auth code exchange requested");

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Authorization code is required");
        }

        ExchangeResult exchangeResult = authCodeStore.exchange(request.getCode());
        if (exchangeResult == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid or expired authorization code. Codes are single-use and expire after 30 seconds.");
        }

        OAuthCallbackResult result = exchangeResult.callbackResult();

        if (result.getType() != OAuthCallbackResult.Type.LOGIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Authorization code is not associated with a login result");
        }

        // SEC-003: PKCE verification
        if (exchangeResult.requiresPkce()) {
            if (request.getCodeVerifier() == null || request.getCodeVerifier().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "code_verifier is required for PKCE-initiated flows");
            }
            if (!PkceUtil.verifyCodeChallenge(request.getCodeVerifier(), exchangeResult.codeChallenge())) {
                log.warn("[OAuth/PKCE] PKCE verification failed: code_verifier does not match code_challenge");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "PKCE verification failed: code_verifier does not match code_challenge");
            }
            log.info("[OAuth/PKCE] PKCE verified successfully");
        }

        log.info("[OAuth] Auth code exchanged successfully -- returning tokens in response body");
        return ApiResponse.success(result.getTokens());
    }

    // ──────────────────────────────────────────────
    //  Existing endpoints (unchanged)
    // ──────────────────────────────────────────────

    /**
     * Complete OAuth signup after user finishes the signup flow.
     */
    @PostMapping("/complete-signup")
    public ApiResponse<TokenResponse> completeSignup(@RequestBody Map<String, String> body) {
        String signupToken = body.get("signupToken");
        String nickname = body.get("nickname");
        log.info("[OAuth] Completing signup: nickname={}", nickname);
        TokenResponse tokens = oAuth2Service.completeOAuthSignup(signupToken, nickname);
        return ApiResponse.success(tokens);
    }

    /**
     * Link OAuth provider to existing account.
     */
    @PostMapping("/link")
    public ApiResponse<TokenResponse> linkAccount(@RequestBody Map<String, String> body) {
        String signupToken = body.get("signupToken");
        log.info("[OAuth] Linking OAuth to existing account");
        TokenResponse tokens = oAuth2Service.linkOAuthToExisting(signupToken);
        return ApiResponse.success(tokens);
    }

    // ──────────────────────────────────────────────
    //  Private helpers
    // ──────────────────────────────────────────────

    /**
     * Build the OAuth provider's authorization URL with state parameter.
     */
    private String buildAuthorizationUrl(String provider, String state) {
        String encodedState = URLEncoder.encode(state, StandardCharsets.UTF_8);

        return switch (provider) {
            case "kakao" -> String.format(
                    "https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=%s&redirect_uri=%s&state=%s",
                    URLEncoder.encode(kakaoRestApiKey, StandardCharsets.UTF_8),
                    URLEncoder.encode(kakaoRedirectUri, StandardCharsets.UTF_8),
                    encodedState
            );
            case "google" -> String.format(
                    "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=%s&redirect_uri=%s&state=%s&scope=openid%%20email%%20profile",
                    URLEncoder.encode(googleClientId, StandardCharsets.UTF_8),
                    URLEncoder.encode(googleRedirectUri, StandardCharsets.UTF_8),
                    encodedState
            );
            case "naver" -> String.format(
                    "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=%s&redirect_uri=%s&state=%s",
                    URLEncoder.encode(naverClientId, StandardCharsets.UTF_8),
                    URLEncoder.encode(naverRedirectUri, StandardCharsets.UTF_8),
                    encodedState
            );
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown OAuth provider: " + provider);
        };
    }
}
