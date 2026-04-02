package com.pochak.admin.rbac.service;

import com.pochak.admin.audit.service.AuditLogService;
import com.pochak.admin.rbac.dto.*;
import com.pochak.admin.rbac.entity.AdminMenu;
import com.pochak.admin.rbac.repository.AdminMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMenuService {

    private final AdminMenuRepository adminMenuRepository;
    private final AuditLogService auditLogService;

    public List<AdminMenuTreeResponse> getMenuTree() {
        List<AdminMenu> roots = adminMenuRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrder();
        return roots.stream()
                .map(this::buildMenuTree)
                .collect(Collectors.toList());
    }

    private AdminMenuTreeResponse buildMenuTree(AdminMenu menu) {
        List<AdminMenu> children = adminMenuRepository.findByParentIdAndIsActiveTrueOrderBySortOrder(menu.getId());
        List<AdminMenuTreeResponse> childResponses = children.stream()
                .map(this::buildMenuTree)
                .collect(Collectors.toList());

        return AdminMenuTreeResponse.fromWithChildren(menu, childResponses);
    }

    public AdminMenuTreeResponse getMenuDetail(Long id) {
        AdminMenu menu = getMenu(id);
        return buildMenuTree(menu);
    }

    public AdminMenu getMenu(Long id) {
        return adminMenuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu not found: " + id));
    }

    @Transactional
    public AdminMenuTreeResponse createMenu(CreateMenuRequest request) {
        AdminMenu parent = null;
        if (request.getParentId() != null) {
            parent = adminMenuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent menu not found: " + request.getParentId()));
        }

        AdminMenu menu = AdminMenu.builder()
                .menuCode(request.getMenuCode())
                .menuName(request.getMenuName())
                .parent(parent)
                .menuPath(request.getMenuPath())
                .iconName(request.getIconName())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        AdminMenu saved = adminMenuRepository.save(menu);
        AdminMenuTreeResponse response = AdminMenuTreeResponse.from(saved);

        auditLogService.log("CREATE", "AdminMenu", saved.getId().toString(), null, response);

        return response;
    }

    @Transactional
    public AdminMenuTreeResponse updateMenu(Long id, UpdateMenuRequest request) {
        AdminMenu menu = getMenu(id);
        AdminMenuTreeResponse before = AdminMenuTreeResponse.from(menu);

        menu.updateInfo(request.getMenuName(), request.getMenuPath(), request.getIconName(), request.getSortOrder());
        AdminMenu saved = adminMenuRepository.save(menu);
        AdminMenuTreeResponse after = AdminMenuTreeResponse.from(saved);

        auditLogService.log("UPDATE", "AdminMenu", id.toString(), before, after);

        return after;
    }

    @Transactional
    public void deleteMenu(Long id) {
        AdminMenu menu = getMenu(id);
        AdminMenuTreeResponse before = AdminMenuTreeResponse.from(menu);

        menu.deactivate();
        adminMenuRepository.save(menu);

        auditLogService.log("DELETE", "AdminMenu", id.toString(), before, null);
    }

    @Transactional
    public void reorderMenus(ReorderMenuRequest request) {
        for (ReorderMenuRequest.MenuOrderItem item : request.getItems()) {
            AdminMenu menu = getMenu(item.getMenuId());
            menu.updateSortOrder(item.getSortOrder());
            adminMenuRepository.save(menu);
        }

        auditLogService.log("REORDER", "AdminMenu", null, null, request.getItems());
    }
}
