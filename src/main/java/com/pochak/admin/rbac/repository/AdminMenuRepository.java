package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminMenuRepository extends JpaRepository<AdminMenu, Long> {

    List<AdminMenu> findByParentIsNullAndIsActiveTrueOrderBySortOrder();

    List<AdminMenu> findByParentIdAndIsActiveTrueOrderBySortOrder(Long parentId);
}
