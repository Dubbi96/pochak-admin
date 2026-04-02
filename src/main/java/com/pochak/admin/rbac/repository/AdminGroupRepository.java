package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminGroupRepository extends JpaRepository<AdminGroup, Long> {

    List<AdminGroup> findByParentIsNullAndIsActiveTrue();

    List<AdminGroup> findByParentIdAndIsActiveTrue(Long parentId);
}
