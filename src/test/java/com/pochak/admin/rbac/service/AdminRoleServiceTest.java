package com.pochak.admin.rbac.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.rbac.dto.AssignFunctionsRequest;
import com.pochak.admin.rbac.dto.AssignMenusRequest;
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
class AdminRoleServiceTest {

    @InjectMocks
    private AdminRoleService adminRoleService;

    @Mock
    private AdminRoleRepository adminRoleRepository;

    @Mock
    private AdminRoleMenuRepository adminRoleMenuRepository;

    @Mock
    private AdminRoleFunctionRepository adminRoleFunctionRepository;

    @Mock
    private AdminMenuRepository adminMenuRepository;

    @Mock
    private AdminFunctionRepository adminFunctionRepository;

    @Mock
    private AuditLogService auditLogService;

    @Test
    @DisplayName("Should assign menus to a role (replace existing)")
    void testAssignMenus() {
        AdminRole role = AdminRole.builder()
                .id(1L)
                .roleCode("ROLE_ADMIN")
                .roleName("Administrator")
                .isActive(true)
                .build();

        AdminMenu menu1 = AdminMenu.builder()
                .id(10L)
                .menuCode("MENU_DASHBOARD")
                .menuName("Dashboard")
                .isActive(true)
                .sortOrder(1)
                .build();

        AdminMenu menu2 = AdminMenu.builder()
                .id(11L)
                .menuCode("MENU_USERS")
                .menuName("Users")
                .isActive(true)
                .sortOrder(2)
                .build();

        when(adminRoleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(adminRoleMenuRepository.findByIdRoleId(1L)).thenReturn(Collections.emptyList());
        when(adminMenuRepository.findById(10L)).thenReturn(Optional.of(menu1));
        when(adminMenuRepository.findById(11L)).thenReturn(Optional.of(menu2));
        when(adminRoleMenuRepository.save(any(AdminRoleMenu.class))).thenAnswer(inv -> inv.getArgument(0));

        AssignMenusRequest request = AssignMenusRequest.builder()
                .menuIds(List.of(10L, 11L))
                .build();

        assertDoesNotThrow(() -> adminRoleService.assignMenus(1L, request));

        verify(adminRoleMenuRepository, times(2)).save(any(AdminRoleMenu.class));
        verify(auditLogService).log(eq("ASSIGN_MENUS"), eq("AdminRole"), eq("1"), isNull(), any());
    }

    @Test
    @DisplayName("Should assign functions to a role (replace existing)")
    void testAssignFunctions() {
        AdminRole role = AdminRole.builder()
                .id(1L)
                .roleCode("ROLE_ADMIN")
                .roleName("Administrator")
                .isActive(true)
                .build();

        AdminFunction func1 = AdminFunction.builder()
                .id(20L)
                .functionCode("USER_CREATE")
                .functionName("Create User")
                .httpMethod("POST")
                .apiPath("/admin/api/v1/rbac/members")
                .isActive(true)
                .build();

        AdminFunction func2 = AdminFunction.builder()
                .id(21L)
                .functionCode("USER_DELETE")
                .functionName("Delete User")
                .httpMethod("DELETE")
                .apiPath("/admin/api/v1/rbac/members/{id}")
                .isActive(true)
                .build();

        when(adminRoleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(adminRoleFunctionRepository.findByIdRoleId(1L)).thenReturn(Collections.emptyList());
        when(adminFunctionRepository.findById(20L)).thenReturn(Optional.of(func1));
        when(adminFunctionRepository.findById(21L)).thenReturn(Optional.of(func2));
        when(adminRoleFunctionRepository.save(any(AdminRoleFunction.class))).thenAnswer(inv -> inv.getArgument(0));

        AssignFunctionsRequest request = AssignFunctionsRequest.builder()
                .functionIds(List.of(20L, 21L))
                .build();

        assertDoesNotThrow(() -> adminRoleService.assignFunctions(1L, request));

        verify(adminRoleFunctionRepository, times(2)).save(any(AdminRoleFunction.class));
        verify(auditLogService).log(eq("ASSIGN_FUNCTIONS"), eq("AdminRole"), eq("1"), isNull(), any());
    }

    @Test
    @DisplayName("Should throw when assigning non-existent menu")
    void testAssignMenusNotFound() {
        AdminRole role = AdminRole.builder()
                .id(1L)
                .roleCode("ROLE_ADMIN")
                .roleName("Administrator")
                .isActive(true)
                .build();

        when(adminRoleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(adminRoleMenuRepository.findByIdRoleId(1L)).thenReturn(Collections.emptyList());
        when(adminMenuRepository.findById(999L)).thenReturn(Optional.empty());

        AssignMenusRequest request = AssignMenusRequest.builder()
                .menuIds(List.of(999L))
                .build();

        assertThrows(IllegalArgumentException.class, () -> adminRoleService.assignMenus(1L, request));
    }

    @Test
    @DisplayName("Should soft delete a role")
    void testDeleteRole() {
        AdminRole role = AdminRole.builder()
                .id(1L)
                .roleCode("ROLE_ADMIN")
                .roleName("Administrator")
                .isActive(true)
                .build();

        when(adminRoleRepository.findById(1L)).thenReturn(Optional.of(role));
        when(adminRoleRepository.save(any(AdminRole.class))).thenAnswer(inv -> inv.getArgument(0));

        adminRoleService.deleteRole(1L);

        assertFalse(role.getIsActive());
        verify(auditLogService).log(eq("DELETE"), eq("AdminRole"), eq("1"), any(), isNull());
    }
}
