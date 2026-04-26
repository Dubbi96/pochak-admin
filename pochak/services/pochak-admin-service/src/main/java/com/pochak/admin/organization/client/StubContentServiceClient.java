package com.pochak.admin.organization.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/**
 * Stub implementation of ContentServiceClient — used only when
 * RestClientContentServiceClient is not available (i.e., content-url not configured).
 */
@Slf4j
@Component
@ConditionalOnMissingBean(RestClientContentServiceClient.class)
public class StubContentServiceClient implements ContentServiceClient {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public OrganizationVerifyResponse toggleVerification(Long orgId) {
        log.warn("[STUB] toggleVerification called for orgId={}", orgId);
        return OrganizationVerifyResponse.builder()
                .id(orgId)
                .name("Organization " + orgId)
                .verified(true)
                .build();
    }

    @Override
    public JsonNode listOrganizations(String orgType, String accessType, String keyword, int page, int size) {
        log.warn("[STUB] listOrganizations called — returning empty page");
        ObjectNode root = objectMapper.createObjectNode();
        root.set("data", objectMapper.createArrayNode());
        root.putObject("meta")
                .put("page", page)
                .put("size", size)
                .put("totalCount", 0)
                .put("totalPages", 0);
        return root;
    }
}
