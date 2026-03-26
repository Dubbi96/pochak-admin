package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminFunction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminFunctionRepository extends JpaRepository<AdminFunction, Long> {

    List<AdminFunction> findByIsActiveTrue();
}
