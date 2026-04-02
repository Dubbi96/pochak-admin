package com.pochak.admin.organization.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.organization.client.ContentServiceClient;
import com.pochak.admin.organization.client.OrganizationVerifyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * M9: Service for admin organization operations, including verification toggle.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminOrganizationService {

    private final ContentServiceClient contentServiceClient;
    private final AuditLogService auditLogService;

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
}
