package com.pochak.admin.organization.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Stub implementation of ContentServiceClient for development.
 * Replace with RestTemplate/WebClient-based implementation for production.
 */
@Slf4j
@Component
public class StubContentServiceClient implements ContentServiceClient {

    @Override
    public OrganizationVerifyResponse toggleVerification(Long orgId) {
        log.warn("[STUB] toggleVerification called for orgId={}", orgId);
        return OrganizationVerifyResponse.builder()
                .id(orgId)
                .name("Organization " + orgId)
                .verified(true)
                .build();
    }
}
