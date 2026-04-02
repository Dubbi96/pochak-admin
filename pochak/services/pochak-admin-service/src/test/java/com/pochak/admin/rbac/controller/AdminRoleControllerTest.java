package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.*;
import com.pochak.admin.rbac.service.AdminRoleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminRoleControllerTest {

    @InjectMocks
    private AdminRoleController adminRoleController;

    @Mock
    private AdminRoleService adminRoleService;

    private AdminRoleResponse sampleRole() {
        return AdminRoleResponse.builder()
                .id(1L)
                .roleCode("SUPER_ADMIN")
                .roleName("슈퍼 관리자")
                .description("전체 시스템 관리 권한")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .menus(Collections.emptyList())
                .functions(Collections.emptyList())
                .build();
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/roles")
    class GetRoles {

        @Test
        @DisplayName("Should return 200 with role list")
        void getRoles_success() {
            given(adminRoleService.getActiveRoleResponses()).willReturn(List.of(sampleRole()));

            ResponseEntity<ApiResponse<List<AdminRoleResponse>>> response = adminRoleController.getRoles();

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).hasSize(1);
            assertThat(response.getBody().getData().get(0).getRoleCode()).isEqualTo("SUPER_ADMIN");
        }

        @Test
        @DisplayName("Should return 200 with empty list when no roles")
        void getRoles_empty() {
            given(adminRoleService.getActiveRoleResponses()).willReturn(Collections.emptyList());

            ResponseEntity<ApiResponse<List<AdminRoleResponse>>> response = adminRoleController.getRoles();

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).isEmpty();
        }
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/roles/{id}")
    class GetRole {

        @Test
        @DisplayName("Should return 200 with role detail")
        void getRole_success() {
            given(adminRoleService.getRoleDetail(1L)).willReturn(sampleRole());

            ResponseEntity<ApiResponse<AdminRoleResponse>> response = adminRoleController.getRole(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData().getRoleCode()).isEqualTo("SUPER_ADMIN");
        }

        @Test
        @DisplayName("Should propagate exception when role not found")
        void getRole_notFound() {
            given(adminRoleService.getRoleDetail(999L))
                    .willThrow(new IllegalArgumentException("Role not found"));

            assertThatThrownBy(() -> adminRoleController.getRole(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Role not found");
        }
    }

    @Nested
    @DisplayName("POST /admin/api/v1/rbac/roles")
    class CreateRole {

        @Test
        @DisplayName("Should return 201 with created role")
        void createRole_success() {
            CreateRoleRequest request = CreateRoleRequest.builder()
                    .roleCode("CONTENT_MANAGER")
                    .roleName("콘텐츠 관리자")
                    .description("콘텐츠 관리 권한")
                    .build();

            AdminRoleResponse created = AdminRoleResponse.builder()
                    .id(2L)
                    .roleCode("CONTENT_MANAGER")
                    .roleName("콘텐츠 관리자")
                    .description("콘텐츠 관리 권한")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .menus(Collections.emptyList())
                    .functions(Collections.emptyList())
                    .build();

            given(adminRoleService.createRole(any(CreateRoleRequest.class))).willReturn(created);

            ResponseEntity<ApiResponse<AdminRoleResponse>> response = adminRoleController.createRole(request);

            assertThat(response.getStatusCode().value()).isEqualTo(201);
            assertThat(response.getBody().getData().getRoleCode()).isEqualTo("CONTENT_MANAGER");
            verify(adminRoleService).createRole(any(CreateRoleRequest.class));
        }
    }

    @Nested
    @DisplayName("PUT /admin/api/v1/rbac/roles/{id}/menus")
    class AssignMenus {

        @Test
        @DisplayName("Should return 200 on successful menu assignment")
        void assignMenus_success() {
            AssignMenusRequest request = AssignMenusRequest.builder()
                    .menuIds(List.of(1L, 2L, 3L))
                    .build();

            doNothing().when(adminRoleService).assignMenus(eq(1L), any(AssignMenusRequest.class));

            ResponseEntity<ApiResponse<Void>> response = adminRoleController.assignMenus(1L, request);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(adminRoleService).assignMenus(eq(1L), any(AssignMenusRequest.class));
        }
    }

    @Nested
    @DisplayName("PUT /admin/api/v1/rbac/roles/{id}/functions")
    class AssignFunctions {

        @Test
        @DisplayName("Should return 200 on successful function assignment")
        void assignFunctions_success() {
            AssignFunctionsRequest request = AssignFunctionsRequest.builder()
                    .functionIds(List.of(1L, 2L))
                    .build();

            doNothing().when(adminRoleService).assignFunctions(eq(1L), any(AssignFunctionsRequest.class));

            ResponseEntity<ApiResponse<Void>> response = adminRoleController.assignFunctions(1L, request);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(adminRoleService).assignFunctions(eq(1L), any(AssignFunctionsRequest.class));
        }
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/roles/{id}/menus")
    class GetRoleMenuTree {

        @Test
        @DisplayName("Should return 200 with role menu tree")
        void getRoleMenuTree_success() {
            AdminMenuTreeResponse menu = AdminMenuTreeResponse.builder()
                    .id(1L)
                    .menuCode("DASHBOARD")
                    .menuName("대시보드")
                    .sortOrder(1)
                    .isActive(true)
                    .children(Collections.emptyList())
                    .build();

            given(adminRoleService.getRoleMenuTree(1L)).willReturn(List.of(menu));

            ResponseEntity<ApiResponse<List<AdminMenuTreeResponse>>> response = adminRoleController.getRoleMenuTree(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).hasSize(1);
            assertThat(response.getBody().getData().get(0).getMenuCode()).isEqualTo("DASHBOARD");
        }
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/roles/{id}/functions")
    class GetRoleFunctions {

        @Test
        @DisplayName("Should return 200 with role functions")
        void getRoleFunctions_success() {
            AdminFunctionResponse fn = AdminFunctionResponse.builder()
                    .id(1L)
                    .functionCode("USER_VIEW")
                    .functionName("회원 조회")
                    .httpMethod("GET")
                    .apiPath("/admin/api/v1/rbac/members")
                    .isActive(true)
                    .build();

            given(adminRoleService.getRoleFunctions(1L)).willReturn(List.of(fn));

            ResponseEntity<ApiResponse<List<AdminFunctionResponse>>> response = adminRoleController.getRoleFunctions(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).hasSize(1);
            assertThat(response.getBody().getData().get(0).getFunctionCode()).isEqualTo("USER_VIEW");
        }
    }

    @Nested
    @DisplayName("DELETE /admin/api/v1/rbac/roles/{id}")
    class DeleteRole {

        @Test
        @DisplayName("Should return 200 on successful deletion")
        void deleteRole_success() {
            doNothing().when(adminRoleService).deleteRole(1L);

            ResponseEntity<ApiResponse<Void>> response = adminRoleController.deleteRole(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(adminRoleService).deleteRole(1L);
        }
    }
}
