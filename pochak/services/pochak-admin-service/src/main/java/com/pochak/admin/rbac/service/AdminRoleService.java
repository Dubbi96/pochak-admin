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
public class AdminRoleService {

    private final AdminRoleRepository adminRoleRepository;
    private final AdminRoleMenuRepository adminRoleMenuRepository;
    private final AdminRoleFunctionRepository adminRoleFunctionRepository;
    private final AdminMenuRepository adminMenuRepository;
    private final AdminFunctionRepository adminFunctionRepository;
    private final AuditLogService auditLogService;

    public List<AdminRole> getActiveRoles() {
        return adminRoleRepository.findByIsActiveTrue();
    }

    public List<AdminRoleResponse> getActiveRoleResponses() {
        return adminRoleRepository.findByIsActiveTrue().stream()
                .map(AdminRoleResponse::from)
                .collect(Collectors.toList());
    }

    public AdminRole getRole(Long id) {
        return adminRoleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin role not found: " + id));
    }

    public AdminRoleResponse getRoleDetail(Long id) {
        AdminRole role = getRole(id);
        List<AdminMenuTreeResponse> menus = getRoleMenuTree(id);
        List<AdminFunctionResponse> functions = getRoleFunctions(id);
        return AdminRoleResponse.from(role, menus, functions);
    }

    @Transactional
    public AdminRoleResponse createRole(CreateRoleRequest request) {
        AdminRole role = AdminRole.builder()
                .roleCode(request.getRoleCode())
                .roleName(request.getRoleName())
                .description(request.getDescription())
                .build();

        AdminRole saved = adminRoleRepository.save(role);
        AdminRoleResponse response = AdminRoleResponse.from(saved);

        auditLogService.log("CREATE", "AdminRole", saved.getId().toString(), null, response);

        return response;
    }

    @Transactional
    public AdminRole createRole(String roleCode, String roleName, String description) {
        AdminRole role = AdminRole.builder()
                .roleCode(roleCode)
                .roleName(roleName)
                .description(description)
                .build();

        AdminRole saved = adminRoleRepository.save(role);
        auditLogService.log("CREATE", "AdminRole", saved.getId().toString(), null, null);
        return saved;
    }

    @Transactional
    public AdminRoleResponse updateRole(Long id, UpdateRoleRequest request) {
        AdminRole role = getRole(id);
        AdminRoleResponse before = AdminRoleResponse.from(role);

        role.updateInfo(request.getRoleName(), request.getDescription());
        AdminRole saved = adminRoleRepository.save(role);
        AdminRoleResponse after = AdminRoleResponse.from(saved);

        auditLogService.log("UPDATE", "AdminRole", id.toString(), before, after);

        return after;
    }

    @Transactional
    public void deleteRole(Long id) {
        AdminRole role = getRole(id);
        AdminRoleResponse before = AdminRoleResponse.from(role);

        role.deactivate();
        adminRoleRepository.save(role);

        auditLogService.log("DELETE", "AdminRole", id.toString(), before, null);
    }

    @Transactional
    public void assignMenus(Long roleId, AssignMenusRequest request) {
        AdminRole role = getRole(roleId);

        // Remove existing menu assignments for this role
        List<AdminRoleMenu> existing = adminRoleMenuRepository.findByIdRoleId(roleId);
        adminRoleMenuRepository.deleteAll(existing);

        // Assign new menus
        for (Long menuId : request.getMenuIds()) {
            AdminMenu menu = adminMenuRepository.findById(menuId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin menu not found: " + menuId));

            AdminRoleMenuId compositeId = new AdminRoleMenuId(roleId, menuId);
            AdminRoleMenu roleMenu = AdminRoleMenu.builder()
                    .id(compositeId)
                    .role(role)
                    .menu(menu)
                    .build();
            adminRoleMenuRepository.save(roleMenu);
        }

        auditLogService.log("ASSIGN_MENUS", "AdminRole", roleId.toString(), null, request.getMenuIds());
    }

    @Transactional
    public void assignFunctions(Long roleId, AssignFunctionsRequest request) {
        AdminRole role = getRole(roleId);

        // Remove existing function assignments for this role
        List<AdminRoleFunction> existing = adminRoleFunctionRepository.findByIdRoleId(roleId);
        adminRoleFunctionRepository.deleteAll(existing);

        // Assign new functions
        for (Long functionId : request.getFunctionIds()) {
            AdminFunction function = adminFunctionRepository.findById(functionId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin function not found: " + functionId));

            AdminRoleFunctionId compositeId = new AdminRoleFunctionId(roleId, functionId);
            AdminRoleFunction roleFunction = AdminRoleFunction.builder()
                    .id(compositeId)
                    .role(role)
                    .function(function)
                    .build();
            adminRoleFunctionRepository.save(roleFunction);
        }

        auditLogService.log("ASSIGN_FUNCTIONS", "AdminRole", roleId.toString(), null, request.getFunctionIds());
    }

    public List<AdminMenuTreeResponse> getRoleMenuTree(Long roleId) {
        List<AdminRoleMenu> roleMenus = adminRoleMenuRepository.findByIdRoleId(roleId);
        Set<Long> menuIds = roleMenus.stream()
                .map(rm -> rm.getMenu().getId())
                .collect(Collectors.toSet());

        // Build tree from root menus that are assigned to this role
        List<AdminMenu> rootMenus = adminMenuRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrder();
        return rootMenus.stream()
                .map(menu -> buildMenuTreeForRole(menu, menuIds))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private AdminMenuTreeResponse buildMenuTreeForRole(AdminMenu menu, Set<Long> assignedMenuIds) {
        List<AdminMenu> children = adminMenuRepository.findByParentIdAndIsActiveTrueOrderBySortOrder(menu.getId());
        List<AdminMenuTreeResponse> childResponses = children.stream()
                .map(child -> buildMenuTreeForRole(child, assignedMenuIds))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (assignedMenuIds.contains(menu.getId()) || !childResponses.isEmpty()) {
            return AdminMenuTreeResponse.fromWithChildren(menu, childResponses);
        }
        return null;
    }

    public List<AdminFunctionResponse> getRoleFunctions(Long roleId) {
        List<AdminRoleFunction> roleFunctions = adminRoleFunctionRepository.findByIdRoleId(roleId);
        return roleFunctions.stream()
                .map(rf -> AdminFunctionResponse.from(rf.getFunction()))
                .collect(Collectors.toList());
    }
}
