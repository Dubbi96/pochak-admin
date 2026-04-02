package com.pochak.admin.audit.scheduler;

import com.pochak.admin.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * L8: Scheduler that deletes audit logs older than 3 years.
 * Runs on the 1st day of every month at 02:00.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuditLogArchiveScheduler {

    private final AuditLogRepository auditLogRepository;

    static final int RETENTION_YEARS = 3;

    /**
     * Delete audit logs older than 3 years.
     * Scheduled to run monthly on the 1st at 02:00 AM.
     */
    @Scheduled(cron = "0 0 2 1 * *")
    @Transactional
    public void archiveOldAuditLogs() {
        LocalDateTime cutoff = LocalDateTime.now().minusYears(RETENTION_YEARS);
        log.info("Starting audit log archival: deleting logs created before {}", cutoff);

        int deletedCount = auditLogRepository.deleteByCreatedAtBefore(cutoff);

        log.info("Audit log archival complete: {} records deleted", deletedCount);
    }

    /**
     * Exposed for testing: delete logs older than the given cutoff.
     */
    @Transactional
    public int archiveOldAuditLogs(LocalDateTime cutoff) {
        return auditLogRepository.deleteByCreatedAtBefore(cutoff);
    }
}
