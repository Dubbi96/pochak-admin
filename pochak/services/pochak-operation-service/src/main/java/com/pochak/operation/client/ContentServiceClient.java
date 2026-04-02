package com.pochak.operation.client;

/**
 * M8: Client interface for calling Content Service to retrieve organization and membership data.
 * Implementations may use RestClient, Feign, or any other HTTP client.
 */
public interface ContentServiceClient {

    /**
     * Retrieve organization information including reservation policy.
     *
     * @param orgId the organization ID
     * @return organization details
     * @throws com.pochak.common.exception.BusinessException if organization not found
     */
    OrganizationResponse getOrganization(Long orgId);

    /**
     * Retrieve the user's membership in a specific organization.
     *
     * @param userId   the user ID
     * @param targetId the organization ID
     * @return membership info, or null if the user is not a member
     */
    MembershipResponse getMembership(Long userId, Long targetId);
}
