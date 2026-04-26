package com.pochak.admin.organization.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.organization.client.ContentServiceClient;
import com.pochak.admin.organization.client.OrganizationVerifyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/**
 * Service for admin organization operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminOrganizationService {

    private final ContentServiceClient contentServiceClient;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Value("${pochak.services.content-url:http://localhost:8082}")
    private String contentServiceUrl;

    /**
     * List organizations via Content Service proxy.
     * Transforms content-service ApiResponse+meta format to standard PageResponse format.
     */
    public JsonNode listOrganizations(String type, String accessType, String keyword, int page, int size) {
        JsonNode raw = contentServiceClient.listOrganizations(type, accessType, keyword, page, size);
        if (raw == null) {
            return emptyPage(page, size);
        }
        return toPageResponse(raw);
    }

    /**
     * Get a single organization by ID via Content Service.
     */
    public JsonNode getOrganization(Long id) {
        try {
            return RestClient.builder()
                    .baseUrl(contentServiceUrl)
                    .build()
                    .get()
                    .uri("/organizations/{id}", id)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (Exception e) {
            log.error("[AdminOrgService] getOrganization failed: id={}, error={}", id, e.getMessage());
            return null;
        }
    }

    /**
     * Toggle the is_verified flag of an organization via Content Service,
     * and record the action in the audit log.
     */
    public OrganizationVerifyResponse toggleVerification(Long orgId, Long adminUserId,
                                                          String ipAddress, String userAgent) {
        OrganizationVerifyResponse response = contentServiceClient.toggleVerification(orgId);

        auditLogService.log(
                adminUserId,
                "TOGGLE_ORGANIZATION_VERIFICATION",
                "Organization",
                String.valueOf(orgId),
                "{\"verified\":" + response.isVerified() + "}",
                ipAddress,
                userAgent
        );

        log.info("Admin {} toggled verification for organization {}: verified={}",
                adminUserId, orgId, response.isVerified());

        return response;
    }

    /**
     * Transform content-service response format:
     *   { success, data: [...], meta: { page, size, totalCount, totalPages } }
     * to standard PageResponse format:
     *   { content: [...], totalElements, totalPages, page, size }
     *
     * Also renames fields to match FE Organization type:
     *   orgType → type
     *   active  → published
     */
    private JsonNode toPageResponse(JsonNode raw) {
        // content-service wraps in ApiResponse envelope with 'data' and 'meta'
        JsonNode data = raw.has("data") ? raw.get("data") : raw;
        JsonNode meta = raw.has("meta") ? raw.get("meta") : objectMapper.createObjectNode();

        // Remap each organization item to match FE Organization type
        com.fasterxml.jackson.databind.node.ArrayNode remapped = objectMapper.createArrayNode();
        if (data.isArray()) {
            for (JsonNode item : data) {
                ObjectNode obj = item.deepCopy();
                // orgType → type
                if (obj.has("orgType") && !obj.has("type")) {
                    obj.set("type", obj.get("orgType"));
                }
                // active → published
                if (obj.has("active") && !obj.has("published")) {
                    obj.set("published", obj.get("active"));
                }
                // parentId → parentOrganizationId
                if (obj.has("parentId") && !obj.has("parentOrganizationId")) {
                    obj.set("parentOrganizationId", obj.get("parentId"));
                }
                // websiteUrl → website
                if (obj.has("websiteUrl") && !obj.has("website")) {
                    obj.set("website", obj.get("websiteUrl"));
                }
                remapped.add(obj);
            }
        }

        ObjectNode result = objectMapper.createObjectNode();
        result.set("content", remapped);
        result.put("totalElements", meta.has("totalCount") ? meta.get("totalCount").asLong() : 0L);
        result.put("totalPages", meta.has("totalPages") ? meta.get("totalPages").asInt() : 0);
        result.put("page", meta.has("page") ? meta.get("page").asInt() : 0);
        result.put("size", meta.has("size") ? meta.get("size").asInt() : 20);
        return result;
    }

    private JsonNode emptyPage(int page, int size) {
        ObjectNode result = objectMapper.createObjectNode();
        result.set("content", objectMapper.createArrayNode());
        result.put("totalElements", 0L);
        result.put("totalPages", 0);
        result.put("page", page);
        result.put("size", size);
        return result;
    }
}
