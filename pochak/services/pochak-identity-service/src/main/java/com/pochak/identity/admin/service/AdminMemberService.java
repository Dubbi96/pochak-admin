package com.pochak.identity.admin.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.admin.dto.*;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminMemberListResponse getMembers(int page, int size, String status, String role,
                                               String search, String searchType) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        User.UserStatus userStatus = (status != null && !status.isEmpty())
                ? User.UserStatus.valueOf(status) : null;
        User.UserRole userRole = (role != null && !role.isEmpty())
                ? User.UserRole.valueOf(role) : null;
        String searchParam = (search != null && !search.isEmpty()) ? search : null;
        String searchTypeParam = (searchParam != null && searchType != null && !searchType.isEmpty())
                ? searchType : null;

        Page<User> userPage = userRepository.searchMembers(
                userStatus, userRole, searchParam, searchTypeParam, pageable);

        var content = userPage.getContent().stream()
                .map(AdminMemberResponse::from)
                .toList();

        return AdminMemberListResponse.builder()
                .content(content)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .page(page)
                .size(size)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminMemberResponse getMember(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found: " + id));
        return AdminMemberResponse.from(user);
    }

    @Transactional
    public AdminMemberResponse updateStatus(Long id, UpdateMemberStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found: " + id));

        User.UserStatus newStatus = User.UserStatus.valueOf(request.getStatus());
        log.info("[Admin] Updating user {} status: {} -> {}", id, user.getStatus(), newStatus);
        user.updateStatus(newStatus);

        return AdminMemberResponse.from(user);
    }

    @Transactional
    public AdminMemberResponse updateRole(Long id, UpdateMemberRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found: " + id));

        User.UserRole newRole = User.UserRole.valueOf(request.getRole());
        log.info("[Admin] Updating user {} role: {} -> {}", id, user.getRole(), newRole);
        user.updateRole(newRole);

        return AdminMemberResponse.from(user);
    }
}
