package com.pochak.admin.rbac.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.rbac.dto.AdminGroupTreeResponse;
import com.pochak.admin.rbac.dto.AssignMembersRequest;
import com.pochak.admin.rbac.entity.*;
import com.pochak.admin.rbac.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminGroupServiceTest {

    @InjectMocks
    private AdminGroupService adminGroupService;

    @Mock
    private AdminGroupRepository adminGroupRepository;

    @Mock
    private AdminGroupUserRepository adminGroupUserRepository;

    @Mock
    private AdminGroupRoleRepository adminGroupRoleRepository;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private AdminRoleRepository adminRoleRepository;

    @Mock
    private AdminRoleMenuRepository adminRoleMenuRepository;

    @Mock
    private AdminRoleFunctionRepository adminRoleFunctionRepository;

    @Mock
    private AuditLogService auditLogService;

    @Test
    @DisplayName("Should return group tree with children")
    void testGetGroupTree() {
        AdminGroup rootGroup = AdminGroup.builder()
                .id(1L)
                .groupCode("ROOT")
                .groupName("Root Group")
                .isActive(true)
                .build();

        AdminGroup childGroup = AdminGroup.builder()
                .id(2L)
                .groupCode("CHILD")
                .groupName("Child Group")
                .parent(rootGroup)
                .isActive(true)
                .build();

        when(adminGroupRepository.findByParentIsNullAndIsActiveTrue()).thenReturn(List.of(rootGroup));
        when(adminGroupRepository.findByParentIdAndIsActiveTrue(1L)).thenReturn(List.of(childGroup));
        when(adminGroupRepository.findByParentIdAndIsActiveTrue(2L)).thenReturn(Collections.emptyList());

        List<AdminGroupTreeResponse> result = adminGroupService.getGroupTree();

        assertEquals(1, result.size());
        assertEquals("ROOT", result.get(0).getGroupCode());
        assertEquals(1, result.get(0).getChildren().size());
        assertEquals("CHILD", result.get(0).getChildren().get(0).getGroupCode());
    }

    @Test
    @DisplayName("Should assign members to a group")
    void testAssignMembers() {
        AdminGroup group = AdminGroup.builder()
                .id(1L)
                .groupCode("GRP1")
                .groupName("Group 1")
                .isActive(true)
                .build();

        AdminUser user = AdminUser.builder()
                .id(10L)
                .loginId("user1")
                .passwordHash("hash")
                .name("User 1")
                .isActive(true)
                .isBlocked(false)
                .failCount(0)
                .build();

        when(adminGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(adminUserRepository.findById(10L)).thenReturn(Optional.of(user));
        when(adminGroupUserRepository.existsById(any(AdminGroupUserId.class))).thenReturn(false);
        when(adminGroupUserRepository.save(any(AdminGroupUser.class))).thenAnswer(inv -> inv.getArgument(0));

        AssignMembersRequest request = AssignMembersRequest.builder()
                .memberIds(List.of(10L))
                .build();

        assertDoesNotThrow(() -> adminGroupService.assignMembers(1L, request));

        verify(adminGroupUserRepository).save(any(AdminGroupUser.class));
        verify(auditLogService).log(eq("ASSIGN_MEMBERS"), eq("AdminGroup"), eq("1"), isNull(), any());
    }

    @Test
    @DisplayName("Should not duplicate when assigning already-assigned member")
    void testAssignMembersNoDuplicate() {
        AdminGroup group = AdminGroup.builder()
                .id(1L)
                .groupCode("GRP1")
                .groupName("Group 1")
                .isActive(true)
                .build();

        AdminUser user = AdminUser.builder()
                .id(10L)
                .loginId("user1")
                .passwordHash("hash")
                .name("User 1")
                .isActive(true)
                .isBlocked(false)
                .failCount(0)
                .build();

        when(adminGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(adminUserRepository.findById(10L)).thenReturn(Optional.of(user));
        when(adminGroupUserRepository.existsById(any(AdminGroupUserId.class))).thenReturn(true);

        AssignMembersRequest request = AssignMembersRequest.builder()
                .memberIds(List.of(10L))
                .build();

        adminGroupService.assignMembers(1L, request);

        verify(adminGroupUserRepository, never()).save(any(AdminGroupUser.class));
    }
}
