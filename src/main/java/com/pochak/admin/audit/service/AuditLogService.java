package com.pochak.admin.audit.service;

import com.pochak.admin.audit.entity.AuditLog;
import com.pochak.admin.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Serializes hash-chain writes so that concurrent audit log entries
     * cannot read the same previousHash.  The synchronized block covers
     * both the read-of-latest-hash and the save (flush) so the DB row
     * is visible to the next caller.
     */
    private final Object hashChainLock = new Object();

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Long adminUserId, String action, String targetType, String targetId,
                    String detail, String ipAddress, String userAgent) {
        synchronized (hashChainLock) {
            String previousHash = getLatestHash();
            AuditLog auditLog = AuditLog.builder()
                    .adminUserId(adminUserId)
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .detail(detail)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .previousHash(previousHash)
                    .build();

            auditLogRepository.saveAndFlush(auditLog);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String targetType, String targetId, Object beforeData, Object afterData) {
        synchronized (hashChainLock) {
            String detail = buildDetail(beforeData, afterData);
            String previousHash = getLatestHash();
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .detail(detail)
                    .previousHash(previousHash)
                    .build();

            auditLogRepository.saveAndFlush(auditLog);
        }
    }

    /**
     * SEC-007: Retrieve the hash of the most recent audit log for chain linking.
     * Must be called within the hashChainLock synchronized block.
     */
    private String getLatestHash() {
        return auditLogRepository.findTopByOrderByIdDesc()
                .map(AuditLog::getHash)
                .orElse(null);
    }

    private String buildDetail(Object beforeData, Object afterData) {
        try {
            StringBuilder sb = new StringBuilder();
            if (beforeData != null) {
                sb.append("{\"before\":");
                sb.append(objectMapper.writeValueAsString(beforeData));
            }
            if (afterData != null) {
                if (sb.length() > 0) sb.append(",");
                else sb.append("{");
                sb.append("\"after\":");
                sb.append(objectMapper.writeValueAsString(afterData));
            }
            if (sb.length() > 0) sb.append("}");
            return sb.toString();
        } catch (Exception e) {
            log.warn("Failed to serialize audit detail", e);
            return null;
        }
    }
}
