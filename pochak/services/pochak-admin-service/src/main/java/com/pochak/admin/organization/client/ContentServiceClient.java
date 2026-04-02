package com.pochak.admin.organization.client;

/**
 * M9: Client interface for calling Content Service to toggle organization verification.
 */
public interface ContentServiceClient {

    /**
     * Toggle the is_verified status of an organization.
     *
     * @param orgId the organization ID
     * @return the updated verification status
     */
    OrganizationVerifyResponse toggleVerification(Long orgId);
}
