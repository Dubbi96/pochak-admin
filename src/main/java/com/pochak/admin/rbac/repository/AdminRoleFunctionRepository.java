package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminRoleFunction;
import com.pochak.admin.rbac.entity.AdminRoleFunctionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminRoleFunctionRepository extends JpaRepository<AdminRoleFunction, AdminRoleFunctionId> {

    List<AdminRoleFunction> findByIdRoleId(Long roleId);

    void deleteByIdRoleId(Long roleId);
}
