package com.pochak.identity.auth.service;

import com.pochak.identity.auth.dto.OAuthCallbackResult;
import com.pochak.identity.auth.dto.TokenResponse;
import com.pochak.identity.auth.service.AuthCodeStore.ExchangeResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AuthCodeStoreTest {

    private AuthCodeStore authCodeStore;

    @BeforeEach
    void setUp() {
        authCodeStore = new AuthCodeStore();
    }

    private OAuthCallbackResult loginResult() {
        return OAuthCallbackResult.builder()
                .type(OAuthCallbackResult.Type.LOGIN)
                .tokens(TokenResponse.builder()
                        .accessToken("access-token")
                        .refreshToken("refresh-token")
                        .expiresIn(1800L)
                        .tokenType("Bearer")
                        .build())
                .build();
    }

    @Test
    @DisplayName("Store and exchange auth code returns correct result")
    void storeAndExchange_validCode_returnsResult() {
        String code = authCodeStore.store(loginResult());

        ExchangeResult result = authCodeStore.exchange(code);

        assertThat(result).isNotNull();
        assertThat(result.callbackResult().getType()).isEqualTo(OAuthCallbackResult.Type.LOGIN);
        assertThat(result.callbackResult().getTokens().getAccessToken()).isEqualTo("access-token");
        assertThat(result.requiresPkce()).isFalse();
    }

    @Test
    @DisplayName("Store with PKCE code_challenge and exchange preserves it")
    void storeWithPkce_exchange_preservesCodeChallenge() {
        String code = authCodeStore.store(loginResult(), "pkce-challenge-123");

        ExchangeResult result = authCodeStore.exchange(code);

        assertThat(result).isNotNull();
        assertThat(result.requiresPkce()).isTrue();
        assertThat(result.codeChallenge()).isEqualTo("pkce-challenge-123");
    }

    @Test
    @DisplayName("Auth code is single-use — second exchange returns null")
    void exchange_sameCodeTwice_secondReturnsNull() {
        String code = authCodeStore.store(loginResult());

        ExchangeResult first = authCodeStore.exchange(code);
        ExchangeResult second = authCodeStore.exchange(code);

        assertThat(first).isNotNull();
        assertThat(second).isNull();
    }

    @Test
    @DisplayName("Unknown auth code returns null")
    void exchange_unknownCode_returnsNull() {
        ExchangeResult result = authCodeStore.exchange("nonexistent-code");

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Each store generates unique codes")
    void store_multipleResults_generatesUniqueCodes() {
        String code1 = authCodeStore.store(loginResult());
        String code2 = authCodeStore.store(loginResult());
        String code3 = authCodeStore.store(loginResult());

        assertThat(code1).isNotEqualTo(code2);
        assertThat(code2).isNotEqualTo(code3);
        assertThat(code1).isNotEqualTo(code3);
    }

    @Test
    @DisplayName("Store without PKCE returns non-PKCE result")
    void storeWithoutPkce_exchange_noPkceRequired() {
        String code = authCodeStore.store(loginResult(), null);

        ExchangeResult result = authCodeStore.exchange(code);

        assertThat(result).isNotNull();
        assertThat(result.requiresPkce()).isFalse();
        assertThat(result.codeChallenge()).isNull();
    }
}
