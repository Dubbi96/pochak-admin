package com.pochak.identity.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Request DTO for exchanging a one-time authorization code for tokens.
 * Used by both web and mobile flows (SEC-006).
 */
@Getter
@NoArgsConstructor
public class AuthCodeExchangeRequest {

    /**
     * The one-time authorization code received via redirect.
     */
    private String code;

    /**
     * Optional PKCE code verifier (used by mobile flows, SEC-003).
     */
    private String codeVerifier;
}
