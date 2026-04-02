package com.pochak.admin.audit.scheduler;

import com.pochak.admin.audit.repository.AuditLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogArchiveSchedulerTest {

    @InjectMocks
    private AuditLogArchiveScheduler auditLogArchiveScheduler;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("L8: archiveOldAuditLogs deletes logs older than 3 years")
    void testArchiveOldAuditLogs_deletesOldLogs() {
        when(auditLogRepository.deleteByCreatedAtBefore(any(LocalDateTime.class))).thenReturn(150);

        auditLogArchiveScheduler.archiveOldAuditLogs();

        ArgumentCaptor<LocalDateTime> cutoffCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(auditLogRepository).deleteByCreatedAtBefore(cutoffCaptor.capture());

        LocalDateTime cutoff = cutoffCaptor.getValue();
        LocalDateTime expectedApprox = LocalDateTime.now().minusYears(3);

        // Cutoff should be approximately 3 years ago (within 1 minute tolerance)
        assertTrue(cutoff.isAfter(expectedApprox.minusMinutes(1)),
                "Cutoff should be approximately 3 years ago");
        assertTrue(cutoff.isBefore(expectedApprox.plusMinutes(1)),
                "Cutoff should be approximately 3 years ago");
    }

    @Test
    @DisplayName("L8: Logs within 3 years are not deleted (cutoff boundary)")
    void testArchiveOldAuditLogs_preservesRecentLogs() {
        // When called with a specific cutoff, only logs before that cutoff are deleted
        LocalDateTime cutoff = LocalDateTime.of(2023, 3, 27, 0, 0);
        when(auditLogRepository.deleteByCreatedAtBefore(cutoff)).thenReturn(0);

        int deleted = auditLogArchiveScheduler.archiveOldAuditLogs(cutoff);

        assertEquals(0, deleted, "No logs should be deleted if none are older than the cutoff");
        verify(auditLogRepository).deleteByCreatedAtBefore(cutoff);
    }

    @Test
    @DisplayName("L8: archiveOldAuditLogs returns correct deletion count")
    void testArchiveOldAuditLogs_returnsCount() {
        LocalDateTime cutoff = LocalDateTime.of(2023, 1, 1, 0, 0);
        when(auditLogRepository.deleteByCreatedAtBefore(cutoff)).thenReturn(42);

        int deleted = auditLogArchiveScheduler.archiveOldAuditLogs(cutoff);

        assertEquals(42, deleted);
    }

    @Test
    @DisplayName("L8: Retention period is 3 years")
    void testRetentionPeriod() {
        assertEquals(3, AuditLogArchiveScheduler.RETENTION_YEARS);
    }
}
