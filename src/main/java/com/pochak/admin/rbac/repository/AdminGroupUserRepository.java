package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminGroupUser;
import com.pochak.admin.rbac.entity.AdminGroupUserId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminGroupUserRepository extends JpaRepository<AdminGroupUser, AdminGroupUserId> {

    List<AdminGroupUser> findByIdGroupId(Long groupId);

    List<AdminGroupUser> findByIdAdminUserId(Long adminUserId);

    void deleteByIdGroupId(Long groupId);
}
