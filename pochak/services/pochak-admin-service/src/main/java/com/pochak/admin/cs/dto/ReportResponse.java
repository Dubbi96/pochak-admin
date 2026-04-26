package com.pochak.admin.cs.dto;

import com.pochak.admin.cs.entity.Report;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long reporterUserId,
        String reporterUsername,
        String targetType,
        Long targetId,
        String targetName,
        String category,
        String description,
        String status,
        String adminNote,
        LocalDateTime resolvedAt,
        LocalDateTime createdAt
) {
    public static ReportResponse from(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getReporterUserId(),
                "user#" + report.getReporterUserId(),
                report.getTargetType(),
                report.getTargetId(),
                report.getTargetType() + "#" + report.getTargetId(),
                report.getReportType() != null ? report.getReportType() : report.getReason(),
                report.getDetail(),
                report.getStatus(),
                report.getAdminComment(),
                report.getProcessedAt(),
                report.getCreatedAt()
        );
    }
}
