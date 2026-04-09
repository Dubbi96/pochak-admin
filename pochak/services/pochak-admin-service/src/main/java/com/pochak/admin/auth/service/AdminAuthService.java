package com.pochak.admin.auth.service;

import com.pochak.admin.auth.dto.AdminLoginRequest;
import com.pochak.admin.auth.dto.AdminLoginResponse;
import com.pochak.admin.rbac.entity.*;
import com.pochak.admin.rbac.repository.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminGroupUserRepository adminGroupUserRepository;
    private final AdminGroupRoleRepository adminGroupRoleRepository;
    private final AdminRoleMenuRepository adminRoleMenuRepository;
    private final AdminRoleFunctionRepository adminRoleFunctionRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiry:3600000}")
    private long accessTokenExpiry;

    @Value("${jwt.refresh-token-expiry:86400000}")
    private long refreshTokenExpiry;

    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        AdminUser adminUser = adminUserRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid login credentials"));

        if (adminUser.getIsBlocked() != null && adminUser.getIsBlocked()) {
            throw new IllegalStateException("Account is blocked due to too many failed login attempts");
        }

        if (!adminUser.getIsActive()) {
            throw new IllegalStateException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), adminUser.getPasswordHash())) {
            adminUser.incrementFailCount();
            adminUserRepository.save(adminUser);
            if (adminUser.getIsBlocked() != null && adminUser.getIsBlocked()) {
                throw new IllegalStateException("Account is now blocked after 5 failed attempts");
            }
            throw new IllegalArgumentException("Invalid login credentials");
        }

        adminUser.recordLoginSuccess();
        adminUserRepository.save(adminUser);

        List<String> roles = loadUserRoles(adminUser.getId());
        List<String> permissions = loadUserPermissions(adminUser.getId());

        String accessToken = generateToken(adminUser, accessTokenExpiry, roles, permissions);
        String refreshToken = generateToken(adminUser, refreshTokenExpiry, roles, permissions);

        return AdminLoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .adminName(adminUser.getName())
                .adminUserId(adminUser.getId())
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    private List<String> loadUserRoles(Long userId) {
        List<AdminGroupUser> groupUsers = adminGroupUserRepository.findByIdAdminUserId(userId);
        Set<String> roleNames = new HashSet<>();

        for (AdminGroupUser gu : groupUsers) {
            List<AdminGroupRole> groupRoles = adminGroupRoleRepository.findByIdGroupId(gu.getGroup().getId());
            for (AdminGroupRole gr : groupRoles) {
                roleNames.add(gr.getRole().getRoleCode());
            }
        }

        return new ArrayList<>(roleNames);
    }

    private List<String> loadUserPermissions(Long userId) {
        List<AdminGroupUser> groupUsers = adminGroupUserRepository.findByIdAdminUserId(userId);
        Set<Long> roleIds = new HashSet<>();

        for (AdminGroupUser gu : groupUsers) {
            List<AdminGroupRole> groupRoles = adminGroupRoleRepository.findByIdGroupId(gu.getGroup().getId());
            for (AdminGroupRole gr : groupRoles) {
                roleIds.add(gr.getRole().getId());
            }
        }

        Set<String> permissions = new HashSet<>();
        for (Long roleId : roleIds) {
            List<AdminRoleFunction> roleFunctions = adminRoleFunctionRepository.findByIdRoleId(roleId);
            for (AdminRoleFunction rf : roleFunctions) {
                permissions.add(rf.getFunction().getFunctionCode());
            }
        }

        return new ArrayList<>(permissions);
    }

    private String generateToken(AdminUser adminUser, long expiry, List<String> roles, List<String> permissions) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();

        return Jwts.builder()
                .subject(adminUser.getId().toString())
                .claim("loginId", adminUser.getLoginId())
                .claim("name", adminUser.getName())
                .claim("roles", roles)
                .claim("permissions", permissions)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiry))
                .signWith(key)
                .compact();
    }
}
