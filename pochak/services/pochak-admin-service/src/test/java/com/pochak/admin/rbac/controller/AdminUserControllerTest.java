package com.pochak.admin.rbac.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.rbac.dto.AdminUserListResponse;
import com.pochak.admin.rbac.service.AdminUserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    @InjectMocks
    private AdminUserController adminUserController;

    @Mock
    private AdminUserService adminUserService;

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/members")
    class GetUsers {

        @Test
        @DisplayName("Should return paginated active users")
        void getUsers_success() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            AdminUserListResponse user = AdminUserListResponse.builder()
                    .id(1L)
                    .loginId("admin")
                    .name("Admin User")
                    .email("admin@pochak.com")
                    .phone("010-1234-5678")
                    .isBlocked(false)
                    .isActive(true)
                    .createdAt(LocalDateTime.of(2026, 1, 1, 0, 0))
                    .build();
            Page<AdminUserListResponse> page = new PageImpl<>(List.of(user), pageable, 1);
            given(adminUserService.getActiveUsers(eq(pageable))).willReturn(page);

            // when
            ResponseEntity<ApiResponse<Page<AdminUserListResponse>>> response =
                    adminUserController.getUsers(pageable);

            // then
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().isSuccess()).isTrue();
            assertThat(response.getBody().getData().getContent()).hasSize(1);
            assertThat(response.getBody().getData().getContent().get(0).getName()).isEqualTo("Admin User");
            assertThat(response.getBody().getData().getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should return empty page when no active users")
        void getUsers_empty() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            Page<AdminUserListResponse> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            given(adminUserService.getActiveUsers(eq(pageable))).willReturn(emptyPage);

            // when
            ResponseEntity<ApiResponse<Page<AdminUserListResponse>>> response =
                    adminUserController.getUsers(pageable);

            // then
            assertThat(response.getBody().getData().getContent()).isEmpty();
            assertThat(response.getBody().getData().getTotalElements()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("GET /admin/api/v1/rbac/members/{id}")
    class GetUser {

        @Test
        @DisplayName("Should return user detail by id")
        void getUser_success() {
            // given
            AdminUserListResponse user = AdminUserListResponse.builder()
                    .id(1L)
                    .loginId("admin")
                    .name("Admin User")
                    .email("admin@pochak.com")
                    .isActive(true)
                    .isBlocked(false)
                    .build();
            given(adminUserService.getUserDetail(1L)).willReturn(user);

            // when
            ResponseEntity<ApiResponse<AdminUserListResponse>> response =
                    adminUserController.getUser(1L);

            // then
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData().getId()).isEqualTo(1L);
            assertThat(response.getBody().getData().getLoginId()).isEqualTo("admin");
        }

        @Test
        @DisplayName("Should propagate exception when user not found")
        void getUser_notFound() {
            // given
            given(adminUserService.getUserDetail(999L))
                    .willThrow(new IllegalArgumentException("Admin user not found: 999"));

            // when & then
            assertThatThrownBy(() -> adminUserController.getUser(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("not found");
        }
    }

    @Nested
    @DisplayName("PATCH /admin/api/v1/rbac/members/{id}/block")
    class BlockUser {

        @Test
        @DisplayName("Should block a user successfully")
        void blockUser_success() {
            // given
            AdminUserListResponse blockedUser = AdminUserListResponse.builder()
                    .id(1L)
                    .loginId("admin")
                    .name("Admin User")
                    .isBlocked(true)
                    .isActive(true)
                    .build();
            given(adminUserService.blockUser(1L)).willReturn(blockedUser);

            // when
            ResponseEntity<ApiResponse<AdminUserListResponse>> response =
                    adminUserController.blockUser(1L);

            // then
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData().getIsBlocked()).isTrue();
            assertThat(response.getBody().getMessage()).contains("blocked");
            verify(adminUserService).blockUser(1L);
        }
    }

    @Nested
    @DisplayName("PATCH /admin/api/v1/rbac/members/{id}/unblock")
    class UnblockUser {

        @Test
        @DisplayName("Should unblock a user successfully")
        void unblockUser_success() {
            // given
            AdminUserListResponse unblockedUser = AdminUserListResponse.builder()
                    .id(1L)
                    .loginId("admin")
                    .name("Admin User")
                    .isBlocked(false)
                    .isActive(true)
                    .build();
            given(adminUserService.unblockUser(1L)).willReturn(unblockedUser);

            // when
            ResponseEntity<ApiResponse<AdminUserListResponse>> response =
                    adminUserController.unblockUser(1L);

            // then
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().getData().getIsBlocked()).isFalse();
            verify(adminUserService).unblockUser(1L);
        }
    }

    @Nested
    @DisplayName("DELETE /admin/api/v1/rbac/members/{id}")
    class DeleteUser {

        @Test
        @DisplayName("Should delete (deactivate) a user")
        void deleteUser_success() {
            // given - no exception means success

            // when
            ResponseEntity<ApiResponse<Void>> response = adminUserController.deleteUser(1L);

            // then
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody().isSuccess()).isTrue();
            verify(adminUserService).deleteUser(1L);
        }
    }
}
