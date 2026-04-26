package com.pochak.admin.organization.client;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Client interface for calling Content Service organization endpoints.
 */
public interface ContentServiceClient {

    /**
     * Toggle the is_verified status of an organization.
     *
     * @param orgId the organization ID
     * @return the updated verification status
     */
    OrganizationVerifyResponse toggleVerification(Long orgId);

    /**
     * List organizations from Content Service with optional filters.
     *
     * @param orgType      filter by org type (ASSOCIATION, PRIVATE, PUBLIC) — nullable
     * @param accessType   filter by access type (OPEN, CLOSED) — nullable
     * @param keyword      search by name — nullable
     * @param page         page number (0-based)
     * @param size         page size
     * @return raw JSON page response from Content Service
     */
    JsonNode listOrganizations(String orgType, String accessType, String keyword, int page, int size);
}
