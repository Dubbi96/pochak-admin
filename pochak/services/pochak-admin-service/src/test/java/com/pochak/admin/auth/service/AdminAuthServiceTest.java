package com.pochak.admin.auth.service;

import com.pochak.admin.auth.dto.AdminLoginRequest;
import com.pochak.admin.auth.dto.AdminLoginResponse;
import com.pochak.admin.rbac.entity.AdminUser;
import com.pochak.admin.rbac.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAuthServiceTest {

    @InjectMocks
    private AdminAuthService adminAuthService;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AdminGroupUserRepository adminGroupUserRepository;

    @Mock
    private AdminGroupRoleRepository adminGroupRoleRepository;

    @Mock
    private AdminRoleMenuRepository adminRoleMenuRepository;

    @Mock
    private AdminRoleFunctionRepository adminRoleFunctionRepository;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminAuthService, "jwtSecret",
                "pochak-admin-secret-key-minimum-256-bits-long-for-hmac-sha256");
        ReflectionTestUtils.setField(adminAuthService, "accessTokenExpiry", 3600000L);
        ReflectionTestUtils.setField(adminAuthService, "refreshTokenExpiry", 86400000L);
    }

    @Test
    @DisplayName("Should login successfully and return JWT tokens")
    void testLoginSuccess() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("admin")
                .passwordHash("$2a$10$encodedHash")
                .name("Admin User")
                .isActive(true)
                .isBlocked(false)
                .failCount(0)
                .build();

        AdminLoginRequest request = new AdminLoginRequest();
        ReflectionTestUtils.setField(request, "loginId", "admin");
        ReflectionTestUtils.setField(request, "password", "password123");

        when(adminUserRepository.findByLoginId("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$10$encodedHash")).thenReturn(true);
        when(adminUserRepository.save(any(AdminUser.class))).thenReturn(user);
        when(adminGroupUserRepository.findByIdAdminUserId(1L)).thenReturn(Collections.emptyList());

        AdminLoginResponse response = adminAuthService.login(request);

        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("Admin User", response.getAdminName());
        assertEquals(1L, response.getAdminUserId());
    }

    @Test
    @DisplayName("Should throw when account is blocked")
    void testLoginBlocked() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("blocked_user")
                .passwordHash("hash")
                .name("Blocked User")
                .isActive(true)
                .isBlocked(true)
                .failCount(5)
                .build();

        AdminLoginRequest request = new AdminLoginRequest();
        ReflectionTestUtils.setField(request, "loginId", "blocked_user");
        ReflectionTestUtils.setField(request, "password", "password123");

        when(adminUserRepository.findByLoginId("blocked_user")).thenReturn(Optional.of(user));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> adminAuthService.login(request));
        assertTrue(exception.getMessage().contains("blocked"));
    }

    @Test
    @DisplayName("Should increment fail count on wrong password")
    void testLoginWrongPassword() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("admin")
                .passwordHash("$2a$10$encodedHash")
                .name("Admin User")
                .isActive(true)
                .isBlocked(false)
                .failCount(0)
                .build();

        AdminLoginRequest request = new AdminLoginRequest();
        ReflectionTestUtils.setField(request, "loginId", "admin");
        ReflectionTestUtils.setField(request, "password", "wrong_password");

        when(adminUserRepository.findByLoginId("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_password", "$2a$10$encodedHash")).thenReturn(false);
        when(adminUserRepository.save(any(AdminUser.class))).thenReturn(user);

        assertThrows(IllegalArgumentException.class, () -> adminAuthService.login(request));
        assertEquals(1, user.getFailCount());
    }

    @Test
    @DisplayName("Should block account after 5 failed attempts")
    void testLoginAutoBlock() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("admin")
                .passwordHash("$2a$10$encodedHash")
                .name("Admin User")
                .isActive(true)
                .isBlocked(false)
                .failCount(4)
                .build();

        AdminLoginRequest request = new AdminLoginRequest();
        ReflectionTestUtils.setField(request, "loginId", "admin");
        ReflectionTestUtils.setField(request, "password", "wrong_password");

        when(adminUserRepository.findByLoginId("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_password", "$2a$10$encodedHash")).thenReturn(false);
        when(adminUserRepository.save(any(AdminUser.class))).thenReturn(user);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> adminAuthService.login(request));
        assertTrue(exception.getMessage().contains("blocked"));
        assertTrue(user.getIsBlocked());
        assertEquals(5, user.getFailCount());
    }

    @Test
    @DisplayName("Should throw when account is deactivated")
    void testLoginDeactivated() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("inactive_user")
                .passwordHash("hash")
                .name("Inactive User")
                .isActive(false)
                .isBlocked(false)
                .failCount(0)
                .build();

        AdminLoginRequest request = new AdminLoginRequest();
        ReflectionTestUtils.setField(request, "loginId", "inactive_user");
        ReflectionTestUtils.setField(request, "password", "password123");

        when(adminUserRepository.findByLoginId("inactive_user")).thenReturn(Optional.of(user));

        assertThrows(IllegalStateException.class, () -> adminAuthService.login(request));
    }
}
