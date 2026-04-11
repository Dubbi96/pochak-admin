package com.pochak.admin.auth.controller;

import com.pochak.admin.auth.dto.AdminLoginRequest;
import com.pochak.admin.auth.dto.AdminLoginResponse;
import com.pochak.admin.auth.service.AdminAuthService;
import com.pochak.admin.common.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminAuthControllerTest {

    @InjectMocks
    private AdminAuthController adminAuthController;

    @Mock
    private AdminAuthService adminAuthService;

    @Nested
    @DisplayName("POST /admin/api/v1/auth/login")
    class Login {

        @Test
        @DisplayName("Should return 200 with tokens on successful login")
        void login_success() {
            // given
            AdminLoginRequest request = new AdminLoginRequest();
            ReflectionTestUtils.setField(request, "loginId", "admin");
            ReflectionTestUtils.setField(request, "password", "password123");

            AdminLoginResponse loginResponse = AdminLoginResponse.builder()
                    .accessToken("jwt-access-token")
                    .refreshToken("jwt-refresh-token")
                    .adminName("Admin User")
                    .adminUserId(1L)
                    .roles(List.of("SUPER_ADMIN"))
                    .permissions(List.of("USER_MANAGE", "CONTENT_MANAGE"))
                    .build();

            given(adminAuthService.login(any(AdminLoginRequest.class))).willReturn(loginResponse);

            // when
            ResponseEntity<ApiResponse<AdminLoginResponse>> response = adminAuthController.login(request);

            // then
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().isSuccess()).isTrue();
            assertThat(response.getBody().getData().getAccessToken()).isEqualTo("jwt-access-token");
            assertThat(response.getBody().getData().getRefreshToken()).isEqualTo("jwt-refresh-token");
            assertThat(response.getBody().getData().getAdminName()).isEqualTo("Admin User");
            assertThat(response.getBody().getData().getAdminUserId()).isEqualTo(1L);
            assertThat(response.getBody().getData().getRoles()).containsExactly("SUPER_ADMIN");
            verify(adminAuthService).login(any(AdminLoginRequest.class));
        }

        @Test
        @DisplayName("Should propagate exception when credentials are invalid")
        void login_invalidCredentials() {
            // given
            AdminLoginRequest request = new AdminLoginRequest();
            ReflectionTestUtils.setField(request, "loginId", "admin");
            ReflectionTestUtils.setField(request, "password", "wrong");

            given(adminAuthService.login(any(AdminLoginRequest.class)))
                    .willThrow(new IllegalArgumentException("Invalid login credentials"));

            // when & then
            assertThatThrownBy(() -> adminAuthController.login(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid login credentials");
        }

        @Test
        @DisplayName("Should propagate exception when account is blocked")
        void login_blockedAccount() {
            // given
            AdminLoginRequest request = new AdminLoginRequest();
            ReflectionTestUtils.setField(request, "loginId", "blocked_user");
            ReflectionTestUtils.setField(request, "password", "password123");

            given(adminAuthService.login(any(AdminLoginRequest.class)))
                    .willThrow(new IllegalStateException("Account is blocked"));

            // when & then
            assertThatThrownBy(() -> adminAuthController.login(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("blocked");
        }
    }
}
