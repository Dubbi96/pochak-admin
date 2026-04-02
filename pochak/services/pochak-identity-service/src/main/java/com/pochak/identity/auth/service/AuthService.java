package com.pochak.identity.auth.service;

import com.pochak.identity.auth.dto.*;

public interface AuthService {

    TokenResponse signUp(SignUpRequest request);

    TokenResponse signIn(SignInRequest request);

    TokenResponse refresh(String refreshToken);

    /** @deprecated SEC-012: Use OAuth2Service.processOAuthCallbackWithResult() instead. */
    @Deprecated
    TokenResponse socialLogin(SocialLoginRequest request);

    void logout(Long userId);

    void withdraw(Long userId);
}
