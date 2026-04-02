package com.pochak.admin.rbac.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.rbac.dto.AdminUserListResponse;
import com.pochak.admin.rbac.dto.CreateAdminUserRequest;
import com.pochak.admin.rbac.dto.UpdateAdminUserRequest;
import com.pochak.admin.rbac.entity.AdminUser;
import com.pochak.admin.rbac.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public Page<AdminUserListResponse> getActiveUsers(Pageable pageable) {
        return adminUserRepository.findByIsActiveTrue(pageable)
                .map(AdminUserListResponse::from);
    }

    public AdminUser getUser(Long id) {
        return adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found: " + id));
    }

    public AdminUserListResponse getUserDetail(Long id) {
        AdminUser user = getUser(id);
        return AdminUserListResponse.from(user);
    }

    @Transactional
    public AdminUserListResponse createUser(CreateAdminUserRequest request) {
        if (adminUserRepository.existsByLoginId(request.getLoginId())) {
            throw new IllegalArgumentException("Login ID already exists: " + request.getLoginId());
        }

        AdminUser user = AdminUser.builder()
                .loginId(request.getLoginId())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();

        AdminUser saved = adminUserRepository.save(user);

        auditLogService.log("CREATE", "AdminUser", saved.getId().toString(), null, AdminUserListResponse.from(saved));

        return AdminUserListResponse.from(saved);
    }

    @Transactional
    public AdminUser createUser(String loginId, String password, String name, String email, String phone) {
        if (adminUserRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("Login ID already exists: " + loginId);
        }

        AdminUser user = AdminUser.builder()
                .loginId(loginId)
                .passwordHash(passwordEncoder.encode(password))
                .name(name)
                .email(email)
                .phone(phone)
                .build();

        AdminUser saved = adminUserRepository.save(user);
        auditLogService.log("CREATE", "AdminUser", saved.getId().toString(), null, AdminUserListResponse.from(saved));
        return saved;
    }

    @Transactional
    public AdminUserListResponse updateUser(Long id, UpdateAdminUserRequest request) {
        AdminUser user = getUser(id);
        AdminUserListResponse before = AdminUserListResponse.from(user);

        user.updateInfo(request.getName(), request.getEmail(), request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.updatePassword(passwordEncoder.encode(request.getPassword()));
        }

        AdminUser saved = adminUserRepository.save(user);
        AdminUserListResponse after = AdminUserListResponse.from(saved);

        auditLogService.log("UPDATE", "AdminUser", id.toString(), before, after);

        return after;
    }

    @Transactional
    public void deleteUser(Long id) {
        AdminUser user = getUser(id);
        AdminUserListResponse before = AdminUserListResponse.from(user);

        user.deactivate();
        adminUserRepository.save(user);

        auditLogService.log("DELETE", "AdminUser", id.toString(), before, null);
    }

    @Transactional
    public AdminUserListResponse blockUser(Long id) {
        AdminUser user = getUser(id);
        AdminUserListResponse before = AdminUserListResponse.from(user);

        user.block();
        AdminUser saved = adminUserRepository.save(user);
        AdminUserListResponse after = AdminUserListResponse.from(saved);

        auditLogService.log("BLOCK", "AdminUser", id.toString(), before, after);

        return after;
    }

    @Transactional
    public AdminUserListResponse unblockUser(Long id) {
        AdminUser user = getUser(id);
        AdminUserListResponse before = AdminUserListResponse.from(user);

        user.unblock();
        AdminUser saved = adminUserRepository.save(user);
        AdminUserListResponse after = AdminUserListResponse.from(saved);

        auditLogService.log("UNBLOCK", "AdminUser", id.toString(), before, after);

        return after;
    }
}
