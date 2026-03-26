package com.pochak.admin.event;

import com.pochak.admin.audit.entity.AuditLog;
import com.pochak.admin.audit.repository.AuditLogRepository;
import com.pochak.common.event.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Listens for all domain events and persists them to the audit_logs table.
 * In Phase 0-2 this only captures events published within the admin service process.
 * In Phase 3 this will become a RabbitMQ consumer receiving events from all services.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;

    @Async
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onDomainEvent(DomainEvent event) {
        log.info("[AuditEventListener] Recording event: type={} eventId={} aggregateId={}",
                event.getEventType(), event.getEventId(), event.getAggregateId());

        AuditLog auditLog = AuditLog.builder()
                .action(event.getEventType())
                .targetType(event.getClass().getSimpleName())
                .targetId(event.getAggregateId())
                .detail(buildDetail(event))
                .build();

        auditLogRepository.save(auditLog);
    }

    private String buildDetail(DomainEvent event) {
        return String.format("{\"eventId\":\"%s\",\"eventType\":\"%s\",\"occurredAt\":\"%s\",\"aggregateId\":\"%s\"}",
                event.getEventId(),
                event.getEventType(),
                event.getOccurredAt(),
                event.getAggregateId());
    }
}
