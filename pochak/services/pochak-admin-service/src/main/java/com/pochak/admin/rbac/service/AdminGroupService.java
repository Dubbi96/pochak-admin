package com.pochak.admin.rbac.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.rbac.dto.*;
import com.pochak.admin.rbac.entity.*;
import com.pochak.admin.rbac.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminGroupService {

    private final AdminGroupRepository adminGroupRepository;
    private final AdminGroupUserRepository adminGroupUserRepository;
    private final AdminGroupRoleRepository adminGroupRoleRepository;
    private final AdminUserRepository adminUserRepository;
    private final AdminRoleRepository adminRoleRepository;
    private final AdminRoleMenuRepository adminRoleMenuRepository;
    private final AdminRoleFunctionRepository adminRoleFunctionRepository;
    private final AuditLogService auditLogService;

    public List<AdminGroupTreeResponse> getGroupTree() {
        List<AdminGroup> roots = adminGroupRepository.findByParentIsNullAndIsActiveTrue();
        return roots.stream()
                .map(this::buildGroupTree)
                .collect(Collectors.toList());
    }

    private AdminGroupTreeResponse buildGroupTree(AdminGroup group) {
        List<AdminGroup> children = adminGroupRepository.findByParentIdAndIsActiveTrue(group.getId());
        List<AdminGroupTreeResponse> childResponses = children.stream()
                .map(this::buildGroupTree)
                .collect(Collectors.toList());

        return AdminGroupTreeResponse.builder()
                .id(group.getId())
                .groupCode(group.getGroupCode())
                .groupName(group.getGroupName())
                .parentId(group.getParent() != null ? group.getParent().getId() : null)
                .description(group.getDescription())
                .isActive(group.getIsActive())
                .createdAt(group.getCreatedAt())
                .children(childResponses)
                .build();
    }

    public List<AdminGroup> getRootGroups() {
        return adminGroupRepository.findByParentIsNullAndIsActiveTrue();
    }

    public AdminGroup getGroup(Long id) {
        return adminGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin group not found: " + id));
    }

    public AdminGroupTreeResponse getGroupDetail(Long id) {
        AdminGroup group = getGroup(id);
        return buildGroupTree(group);
    }

    @Transactional
    public AdminGroupTreeResponse createGroup(CreateGroupRequest request) {
        AdminGroup parent = null;
        if (request.getParentId() != null) {
            parent = adminGroupRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent group not found: " + request.getParentId()));
        }

        AdminGroup group = AdminGroup.builder()
                .groupCode(request.getGroupCode())
                .groupName(request.getGroupName())
                .parent(parent)
                .description(request.getDescription())
                .build();

        AdminGroup saved = adminGroupRepository.save(group);
        AdminGroupTreeResponse response = buildGroupTree(saved);

        auditLogService.log("CREATE", "AdminGroup", saved.getId().toString(), null, response);

        return response;
    }

    @Transactional
    public AdminGroup createGroup(String groupCode, String groupName, Long parentId, String description) {
        AdminGroup parent = null;
        if (parentId != null) {
            parent = adminGroupRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent group not found: " + parentId));
        }

        AdminGroup group = AdminGroup.builder()
                .groupCode(groupCode)
                .groupName(groupName)
                .parent(parent)
                .description(description)
                .build();

        AdminGroup saved = adminGroupRepository.save(group);
        auditLogService.log("CREATE", "AdminGroup", saved.getId().toString(), null, null);
        return saved;
    }

    @Transactional
    public AdminGroupTreeResponse updateGroup(Long id, UpdateGroupRequest request) {
        AdminGroup group = getGroup(id);
        AdminGroupTreeResponse before = buildGroupTree(group);

        group.updateInfo(request.getGroupName(), request.getDescription());
        AdminGroup saved = adminGroupRepository.save(group);
        AdminGroupTreeResponse after = buildGroupTree(saved);

        auditLogService.log("UPDATE", "AdminGroup", id.toString(), before, after);

        return after;
    }

    @Transactional
    public void deleteGroup(Long id) {
        AdminGroup group = getGroup(id);
        AdminGroupTreeResponse before = buildGroupTree(group);

        group.deactivate();
        adminGroupRepository.save(group);

        auditLogService.log("DELETE", "AdminGroup", id.toString(), before, null);
    }

    @Transactional
    public void assignMembers(Long groupId, AssignMembersRequest request) {
        AdminGroup group = getGroup(groupId);

        for (Long memberId : request.getMemberIds()) {
            AdminUser user = adminUserRepository.findById(memberId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found: " + memberId));

            AdminGroupUserId compositeId = new AdminGroupUserId(groupId, memberId);
            if (!adminGroupUserRepository.existsById(compositeId)) {
                AdminGroupUser groupUser = AdminGroupUser.builder()
                        .id(compositeId)
                        .group(group)
                        .adminUser(user)
                        .build();
                adminGroupUserRepository.save(groupUser);
            }
        }

        auditLogService.log("ASSIGN_MEMBERS", "AdminGroup", groupId.toString(), null, request.getMemberIds());
    }

    @Transactional
    public void removeMembers(Long groupId, AssignMembersRequest request) {
        for (Long memberId : request.getMemberIds()) {
            AdminGroupUserId compositeId = new AdminGroupUserId(groupId, memberId);
            adminGroupUserRepository.deleteById(compositeId);
        }

        auditLogService.log("REMOVE_MEMBERS", "AdminGroup", groupId.toString(), request.getMemberIds(), null);
    }

    @Transactional
    public void assignRoles(Long groupId, AssignRolesRequest request) {
        AdminGroup group = getGroup(groupId);

        for (Long roleId : request.getRoleIds()) {
            AdminRole role = adminRoleRepository.findById(roleId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin role not found: " + roleId));

            AdminGroupRoleId compositeId = new AdminGroupRoleId(groupId, roleId);
            if (!adminGroupRoleRepository.existsById(compositeId)) {
                AdminGroupRole groupRole = AdminGroupRole.builder()
                        .id(compositeId)
                        .group(group)
                        .role(role)
                        .build();
                adminGroupRoleRepository.save(groupRole);
            }
        }

        auditLogService.log("ASSIGN_ROLES", "AdminGroup", groupId.toString(), null, request.getRoleIds());
    }

    @Transactional
    public void removeRoles(Long groupId, AssignRolesRequest request) {
        for (Long roleId : request.getRoleIds()) {
            AdminGroupRoleId compositeId = new AdminGroupRoleId(groupId, roleId);
            adminGroupRoleRepository.deleteById(compositeId);
        }

        auditLogService.log("REMOVE_ROLES", "AdminGroup", groupId.toString(), request.getRoleIds(), null);
    }

    public List<String> getEffectivePermissions(Long groupId) {
        Set<String> permissions = new HashSet<>();
        collectPermissionsRecursively(groupId, permissions);
        return new ArrayList<>(permissions);
    }

    private void collectPermissionsRecursively(Long groupId, Set<String> permissions) {
        AdminGroup group = getGroup(groupId);

        // Collect permissions from this group's roles
        List<AdminGroupRole> groupRoles = adminGroupRoleRepository.findByIdGroupId(groupId);
        for (AdminGroupRole gr : groupRoles) {
            List<AdminRoleMenu> roleMenus = adminRoleMenuRepository.findByIdRoleId(gr.getRole().getId());
            for (AdminRoleMenu rm : roleMenus) {
                permissions.add("MENU:" + rm.getMenu().getMenuCode());
            }

            List<AdminRoleFunction> roleFunctions = adminRoleFunctionRepository.findByIdRoleId(gr.getRole().getId());
            for (AdminRoleFunction rf : roleFunctions) {
                permissions.add("FUNC:" + rf.getFunction().getFunctionCode());
            }
        }

        // Inherit from parent
        if (group.getParent() != null) {
            collectPermissionsRecursively(group.getParent().getId(), permissions);
        }
    }

    public List<AdminUserListResponse> getGroupMembers(Long groupId) {
        List<AdminGroupUser> groupUsers = adminGroupUserRepository.findByIdGroupId(groupId);
        return groupUsers.stream()
                .map(gu -> AdminUserListResponse.from(gu.getAdminUser()))
                .collect(Collectors.toList());
    }

    public List<AdminRoleResponse> getGroupRoles(Long groupId) {
        List<AdminGroupRole> groupRoles = adminGroupRoleRepository.findByIdGroupId(groupId);
        return groupRoles.stream()
                .map(gr -> AdminRoleResponse.from(gr.getRole()))
                .collect(Collectors.toList());
    }
}
