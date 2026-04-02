package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.*;
import com.pochak.admin.rbac.service.AdminGroupService;
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
class AdminGroupControllerTest {

    @InjectMocks
    private AdminGroupController adminGroupController;

    @Mock
    private AdminGroupService adminGroupService;

    private AdminGroupTreeResponse sampleGroup() {
        return AdminGroupTreeResponse.builder()
                .id(1L)
                .groupCode("DEV_TEAM")
                .groupName("개발팀")
                .parentId(null)
                .description("개발팀 그룹")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .children(Collections.emptyList())
                .build();
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/groups")
    class GetGroupTree {

        @Test
        @DisplayName("Should return 200 with group tree")
        void getGroupTree_success() {
            given(adminGroupService.getGroupTree()).willReturn(List.of(sampleGroup()));

            ResponseEntity<ApiResponse<List<AdminGroupTreeResponse>>> response = adminGroupController.getGroupTree();

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).hasSize(1);
            assertThat(response.getBody().getData().get(0).getGroupCode()).isEqualTo("DEV_TEAM");
        }

        @Test
        @DisplayName("Should return 200 with empty tree")
        void getGroupTree_empty() {
            given(adminGroupService.getGroupTree()).willReturn(Collections.emptyList());

            ResponseEntity<ApiResponse<List<AdminGroupTreeResponse>>> response = adminGroupController.getGroupTree();

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).isEmpty();
        }
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/groups/{id}")
    class GetGroup {

        @Test
        @DisplayName("Should return 200 with group detail")
        void getGroup_success() {
            given(adminGroupService.getGroupDetail(1L)).willReturn(sampleGroup());

            ResponseEntity<ApiResponse<AdminGroupTreeResponse>> response = adminGroupController.getGroup(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData().getGroupName()).isEqualTo("개발팀");
        }

        @Test
        @DisplayName("Should propagate exception when group not found")
        void getGroup_notFound() {
            given(adminGroupService.getGroupDetail(999L))
                    .willThrow(new IllegalArgumentException("Group not found"));

            assertThatThrownBy(() -> adminGroupController.getGroup(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Group not found");
        }
    }

    @Nested
    @DisplayName("POST /admin/api/v1/rbac/groups")
    class CreateGroup {

        @Test
        @DisplayName("Should return 201 with created group")
        void createGroup_success() {
            CreateGroupRequest request = CreateGroupRequest.builder()
                    .groupCode("QA_TEAM")
                    .groupName("QA팀")
                    .description("QA팀 그룹")
                    .build();

            AdminGroupTreeResponse created = AdminGroupTreeResponse.builder()
                    .id(2L)
                    .groupCode("QA_TEAM")
                    .groupName("QA팀")
                    .description("QA팀 그룹")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .children(Collections.emptyList())
                    .build();

            given(adminGroupService.createGroup(any(CreateGroupRequest.class))).willReturn(created);

            ResponseEntity<ApiResponse<AdminGroupTreeResponse>> response = adminGroupController.createGroup(request);

            assertThat(response.getStatusCode().value()).isEqualTo(201);
            assertThat(response.getBody().getData().getGroupCode()).isEqualTo("QA_TEAM");
        }
    }

    @Nested
    @DisplayName("POST /admin/api/v1/rbac/groups/{id}/members")
    class AssignMembers {

        @Test
        @DisplayName("Should return 200 on successful member assignment")
        void assignMembers_success() {
            AssignMembersRequest request = AssignMembersRequest.builder()
                    .memberIds(List.of(1L, 2L))
                    .build();

            doNothing().when(adminGroupService).assignMembers(eq(1L), any(AssignMembersRequest.class));

            ResponseEntity<ApiResponse<Void>> response = adminGroupController.assignMembers(1L, request);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(adminGroupService).assignMembers(eq(1L), any(AssignMembersRequest.class));
        }
    }

    @Nested
    @DisplayName("POST /admin/api/v1/rbac/groups/{id}/roles")
    class AssignRoles {

        @Test
        @DisplayName("Should return 200 on successful role assignment")
        void assignRoles_success() {
            AssignRolesRequest request = AssignRolesRequest.builder()
                    .roleIds(List.of(1L))
                    .build();

            doNothing().when(adminGroupService).assignRoles(eq(1L), any(AssignRolesRequest.class));

            ResponseEntity<ApiResponse<Void>> response = adminGroupController.assignRoles(1L, request);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(adminGroupService).assignRoles(eq(1L), any(AssignRolesRequest.class));
        }
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/groups/{id}/permissions")
    class GetEffectivePermissions {

        @Test
        @DisplayName("Should return 200 with effective permissions")
        void getEffectivePermissions_success() {
            given(adminGroupService.getEffectivePermissions(1L))
                    .willReturn(List.of("USER_VIEW", "USER_EDIT", "CONTENT_VIEW"));

            ResponseEntity<ApiResponse<List<String>>> response = adminGroupController.getEffectivePermissions(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData()).containsExactly("USER_VIEW", "USER_EDIT", "CONTENT_VIEW");
        }
    }

    @Nested
    @DisplayName("DELETE /admin/api/v1/rbac/groups/{id}")
    class DeleteGroup {

        @Test
        @DisplayName("Should return 200 on successful deletion")
        void deleteGroup_success() {
            doNothing().when(adminGroupService).deleteGroup(1L);

            ResponseEntity<ApiResponse<Void>> response = adminGroupController.deleteGroup(1L);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(adminGroupService).deleteGroup(1L);
        }
    }
}
