package com.pochak.admin.rbac.repository;

import com.pochak.admin.rbac.entity.AdminUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByLoginId(String loginId);

    Page<AdminUser> findByIsActiveTrue(Pageable pageable);

    boolean existsByLoginId(String loginId);
}
