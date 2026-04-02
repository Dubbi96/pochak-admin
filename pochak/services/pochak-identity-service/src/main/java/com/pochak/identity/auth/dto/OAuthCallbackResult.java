package com.pochak.identity.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OAuthCallbackResult {

    public enum Type {
        LOGIN,              // Existing user → issue JWT
        SIGNUP_REQUIRED,    // New user → redirect to signup flow
        LINK_EXISTING       // Email exists but no OAuth link → ask to link
    }

    private final Type type;

    // For LOGIN
    private final TokenResponse tokens;

    // For SIGNUP_REQUIRED / LINK_EXISTING
    private final String signupToken;       // Temporary token carrying OAuth info
    private final String provider;
    private final String providerId;
    private final String email;
    private final String name;
    private final String profileImageUrl;
    private final Long existingUserId;      // For LINK_EXISTING
}
