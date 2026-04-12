package com.pochak.admin.audit.controller;

import com.pochak.admin.audit.entity.AuditLog;
import com.pochak.admin.audit.repository.AuditLogRepository;
import com.pochak.admin.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/api/v1/audit")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/logs")
    public ApiResponse<Map<String, Object>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long adminUserId) {

        PageRequest pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> result;

        if (adminUserId != null) {
            result = auditLogRepository.findByAdminUserIdOrderByCreatedAtDesc(adminUserId, pageable);
        } else {
            result = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<Map<String, Object>> items = result.getContent().stream()
                .map(log -> Map.<String, Object>of(
                        "id", log.getId(),
                        "adminUserId", log.getAdminUserId() != null ? log.getAdminUserId() : 0,
                        "action", log.getAction(),
                        "targetType", log.getTargetType() != null ? log.getTargetType() : "",
                        "targetId", log.getTargetId() != null ? log.getTargetId() : "",
                        "createdAt", log.getCreatedAt().toString()
                ))
                .toList();

        return ApiResponse.ok(Map.of(
                "items", items,
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages()
        ));
    }
}
