package com.pochak.admin.audit.repository;

import com.pochak.admin.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Delete audit logs created before the given cutoff date.
     * Used by AuditLogArchiveScheduler for retention policy enforcement.
     */
    int deleteByCreatedAtBefore(LocalDateTime cutoff);

    Page<AuditLog> findByAdminUserIdOrderByCreatedAtDesc(Long adminUserId, Pageable pageable);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * SEC-007: Retrieve the most recent audit log to get its hash for chain linking.
     */
    java.util.Optional<AuditLog> findTopByOrderByIdDesc();
}
