package com.pochak.admin.rbac.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.rbac.dto.AdminUserListResponse;
import com.pochak.admin.rbac.dto.CreateAdminUserRequest;
import com.pochak.admin.rbac.entity.AdminUser;
import com.pochak.admin.rbac.repository.AdminUserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @InjectMocks
    private AdminUserService adminUserService;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditLogService auditLogService;

    @Test
    @DisplayName("Should create a new admin user successfully")
    void testCreateUser() {
        CreateAdminUserRequest request = CreateAdminUserRequest.builder()
                .loginId("testuser")
                .password("password123")
                .name("Test User")
                .email("test@example.com")
                .phone("010-1234-5678")
                .build();

        when(adminUserRepository.existsByLoginId("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encodedHash");
        when(adminUserRepository.save(any(AdminUser.class))).thenAnswer(invocation -> {
            AdminUser user = invocation.getArgument(0);
            return AdminUser.builder()
                    .id(1L)
                    .loginId(user.getLoginId())
                    .passwordHash(user.getPasswordHash())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .isActive(true)
                    .isBlocked(false)
                    .failCount(0)
                    .build();
        });

        AdminUserListResponse result = adminUserService.createUser(request);

        assertNotNull(result);
        assertEquals("testuser", result.getLoginId());
        assertEquals("Test User", result.getName());
        assertFalse(result.getIsBlocked());
        verify(adminUserRepository).save(any(AdminUser.class));
        verify(auditLogService).log(eq("CREATE"), eq("AdminUser"), anyString(), isNull(), any());
    }

    @Test
    @DisplayName("Should throw exception when login ID already exists")
    void testCreateDuplicateLoginId() {
        CreateAdminUserRequest request = CreateAdminUserRequest.builder()
                .loginId("existing_user")
                .password("password123")
                .name("Test User")
                .build();

        when(adminUserRepository.existsByLoginId("existing_user")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> adminUserService.createUser(request));
        verify(adminUserRepository, never()).save(any(AdminUser.class));
    }

    @Test
    @DisplayName("Should block a user and set isBlocked to true")
    void testBlockUser() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("testuser")
                .passwordHash("hash")
                .name("Test User")
                .isActive(true)
                .isBlocked(false)
                .failCount(0)
                .build();

        when(adminUserRepository.findById(1L)).thenReturn(Optional.of(user));
        when(adminUserRepository.save(any(AdminUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserListResponse result = adminUserService.blockUser(1L);

        assertTrue(result.getIsBlocked());
        verify(auditLogService).log(eq("BLOCK"), eq("AdminUser"), eq("1"), any(), any());
    }

    @Test
    @DisplayName("Should return paginated active admin users")
    void testGetActiveUsers() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("testuser")
                .passwordHash("hash")
                .name("Test User")
                .isActive(true)
                .isBlocked(false)
                .failCount(0)
                .build();

        Pageable pageable = PageRequest.of(0, 20);
        Page<AdminUser> page = new PageImpl<>(List.of(user), pageable, 1);
        when(adminUserRepository.findByIsActiveTrue(pageable)).thenReturn(page);

        Page<AdminUserListResponse> result = adminUserService.getActiveUsers(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("testuser", result.getContent().get(0).getLoginId());
    }

    @Test
    @DisplayName("Should throw exception when admin user not found")
    void testGetUserNotFound() {
        when(adminUserRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> adminUserService.getUser(999L));
    }

    @Test
    @DisplayName("Should unblock a user and reset fail count")
    void testUnblockUser() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("testuser")
                .passwordHash("hash")
                .name("Test User")
                .isActive(true)
                .isBlocked(true)
                .failCount(5)
                .build();

        when(adminUserRepository.findById(1L)).thenReturn(Optional.of(user));
        when(adminUserRepository.save(any(AdminUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserListResponse result = adminUserService.unblockUser(1L);

        assertFalse(result.getIsBlocked());
        verify(auditLogService).log(eq("UNBLOCK"), eq("AdminUser"), eq("1"), any(), any());
    }

    @Test
    @DisplayName("Should soft delete a user by deactivating")
    void testDeleteUser() {
        AdminUser user = AdminUser.builder()
                .id(1L)
                .loginId("testuser")
                .passwordHash("hash")
                .name("Test User")
                .isActive(true)
                .isBlocked(false)
                .failCount(0)
                .build();

        when(adminUserRepository.findById(1L)).thenReturn(Optional.of(user));
        when(adminUserRepository.save(any(AdminUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        adminUserService.deleteUser(1L);

        assertFalse(user.getIsActive());
        verify(auditLogService).log(eq("DELETE"), eq("AdminUser"), eq("1"), any(), isNull());
    }
}
