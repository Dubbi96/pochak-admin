package com.pochak.identity.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Calls commerce-service to eagerly initialize a wallet for a newly registered user.
 * commerce-service uses lazy createWalletIfNotExists, so a GET is sufficient to trigger creation.
 * Best-effort: failure is logged and does NOT roll back user creation.
 */
@Slf4j
@Component
public class WalletClient {

    private final RestClient restClient;

    public WalletClient(@Value("${pochak.services.commerce-url}") String commerceUrl) {
        this.restClient = RestClient.builder().baseUrl(commerceUrl).build();
    }

    public void initWallet(Long userId) {
        try {
            restClient.get()
                    .uri("/wallet")
                    .header("X-User-Id", userId.toString())
                    .retrieve()
                    .toBodilessEntity();
            log.info("[Wallet] Initialized wallet for userId={}", userId);
        } catch (RestClientException e) {
            log.warn("[Wallet] Failed to initialize wallet for userId={}: {}. Will be created lazily on first use.",
                    userId, e.getMessage());
        }
    }
}
