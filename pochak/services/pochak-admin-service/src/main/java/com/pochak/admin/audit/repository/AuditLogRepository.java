package com.pochak.admin.audit.repository;

import com.pochak.admin.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByAdminUserIdOrderByCreatedAtDesc(Long adminUserId, Pageable pageable);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * SEC-007: Retrieve the most recent audit log to get its hash for chain linking.
     */
    java.util.Optional<AuditLog> findTopByOrderByIdDesc();

    /**
     * L8: Delete audit logs older than the given cutoff date.
     * Returns the number of deleted records.
     */
    int deleteByCreatedAtBefore(java.time.LocalDateTime cutoff);
}
