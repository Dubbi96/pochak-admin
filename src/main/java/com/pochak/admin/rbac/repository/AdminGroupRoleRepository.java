package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminGroupRole;
import com.pochak.admin.rbac.entity.AdminGroupRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminGroupRoleRepository extends JpaRepository<AdminGroupRole, AdminGroupRoleId> {

    List<AdminGroupRole> findByIdGroupId(Long groupId);

    List<AdminGroupRole> findByIdRoleId(Long roleId);

    void deleteByIdGroupId(Long groupId);
}
