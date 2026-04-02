package com.pochak.admin.event;

import com.pochak.admin.audit.entity.AuditLog;
import com.pochak.admin.audit.repository.AuditLogRepository;
import com.pochak.common.event.RabbitMqConfig;
import com.pochak.common.event.UserWithdrawnEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * DATA-001: Handles user withdrawal event for the admin service.
 *
 * Per-table policy:
 *   - audit_logs: NO CHANGE (permanent retention for compliance)
 *
 * This listener only records the withdrawal event as an audit log entry.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserWithdrawalListener {

    private final AuditLogRepository auditLogRepository;

    @RabbitListener(queues = RabbitMqConfig.QUEUE_ADMIN)
    @Transactional
    public void handleUserWithdrawn(UserWithdrawnEvent event) {
        if (!UserWithdrawnEvent.ROUTING_KEY.equals(event.getEventType())) {
            return;
        }

        Long userId = event.getUserId();
        log.info("[UserWithdrawal] User {} withdrawn. Audit logs retained (permanent retention).", userId);

        // Record the withdrawal itself as an audit log entry for traceability
        String detail = String.format(
                "{\"action\":\"USER_WITHDRAWAL\",\"userId\":%d,\"emailHash\":\"%s\",\"withdrawnAt\":\"%s\"}",
                userId, event.getEmailHash(), event.getWithdrawnAt());

        AuditLog withdrawalLog = AuditLog.builder()
                .action("USER_WITHDRAWAL")
                .targetType("User")
                .targetId(String.valueOf(userId))
                .detail(detail)
                .build();

        auditLogRepository.save(withdrawalLog);
        log.info("[UserWithdrawal] Audit log entry created for user withdrawal: userId={}", userId);
    }
}
