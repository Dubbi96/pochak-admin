package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminRoleMenu;
import com.pochak.admin.rbac.entity.AdminRoleMenuId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminRoleMenuRepository extends JpaRepository<AdminRoleMenu, AdminRoleMenuId> {

    List<AdminRoleMenu> findByIdRoleId(Long roleId);

    void deleteByIdRoleId(Long roleId);
}
