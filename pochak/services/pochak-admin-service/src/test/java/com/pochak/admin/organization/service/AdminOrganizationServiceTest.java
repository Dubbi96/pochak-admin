package com.pochak.admin.organization.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.organization.client.ContentServiceClient;
import com.pochak.admin.organization.client.OrganizationVerifyResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminOrganizationServiceTest {

    @InjectMocks
    private AdminOrganizationService adminOrganizationService;

    @Mock
    private ContentServiceClient contentServiceClient;

    @Mock
    private AuditLogService auditLogService;

    @Test
    @DisplayName("M9: toggleVerification calls Content Service and returns result")
    void testToggleVerification_callsContentService() {
        Long orgId = 1L;
        Long adminUserId = 10L;

        when(contentServiceClient.toggleVerification(orgId)).thenReturn(
                OrganizationVerifyResponse.builder()
                        .id(orgId)
                        .name("Test Organization")
                        .verified(true)
                        .build()
        );

        OrganizationVerifyResponse response = adminOrganizationService.toggleVerification(
                orgId, adminUserId, "127.0.0.1", "TestAgent");

        assertNotNull(response);
        assertEquals(orgId, response.getId());
        assertTrue(response.isVerified());
        verify(contentServiceClient).toggleVerification(orgId);
    }

    @Test
    @DisplayName("M9: toggleVerification records audit log")
    void testToggleVerification_recordsAuditLog() {
        Long orgId = 2L;
        Long adminUserId = 10L;

        when(contentServiceClient.toggleVerification(orgId)).thenReturn(
                OrganizationVerifyResponse.builder()
                        .id(orgId)
                        .name("Another Org")
                        .verified(false)
                        .build()
        );

        adminOrganizationService.toggleVerification(orgId, adminUserId, "192.168.1.1", "Chrome");

        verify(auditLogService).log(
                eq(adminUserId),
                eq("TOGGLE_ORGANIZATION_VERIFICATION"),
                eq("Organization"),
                eq("2"),
                contains("\"verified\":false"),
                eq("192.168.1.1"),
                eq("Chrome")
        );
    }

    @Test
    @DisplayName("M9: toggleVerification propagates Content Service exception")
    void testToggleVerification_propagatesException() {
        Long orgId = 999L;
        Long adminUserId = 10L;

        when(contentServiceClient.toggleVerification(orgId))
                .thenThrow(new RuntimeException("Organization not found"));

        assertThrows(RuntimeException.class, () ->
                adminOrganizationService.toggleVerification(orgId, adminUserId, "127.0.0.1", "TestAgent"));

        // Audit log should NOT be called if Content Service fails
        verify(auditLogService, never()).log(anyLong(), anyString(), anyString(),
                anyString(), anyString(), anyString(), anyString());
    }
}
