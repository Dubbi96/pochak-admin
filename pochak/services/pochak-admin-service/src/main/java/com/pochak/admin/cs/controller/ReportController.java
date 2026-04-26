package com.pochak.admin.cs.controller;

import com.pochak.admin.common.AdminPageResponse;
import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.cs.dto.ReportResponse;
import com.pochak.admin.cs.entity.Report;
import com.pochak.admin.cs.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/admin/api/v1/cs/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminPageResponse<ReportResponse>>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LocalDateTime from = dateFrom != null ? LocalDate.parse(dateFrom).atStartOfDay() : null;
        LocalDateTime to = dateTo != null ? LocalDate.parse(dateTo).atTime(23, 59, 59) : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Report> result = reportRepository.findWithFilters(
                status, category, targetType, from, to, pageable
        );

        Page<ReportResponse> mapped = result.map(ReportResponse::from);
        return ResponseEntity.ok(ApiResponse.ok(AdminPageResponse.from(mapped)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(ReportResponse.from(report)));
    }

    @PutMapping("/{id}/action")
    @Transactional
    public ResponseEntity<ApiResponse<ReportResponse>> actionReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newStatus = body.getOrDefault("status", "RESOLVED");
        String adminNote = body.get("adminNote");

        int updated = reportRepository.updateAction(id, newStatus, adminNote, LocalDateTime.now());
        if (updated == 0) {
            return ResponseEntity.notFound().build();
        }

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(ReportResponse.from(report)));
    }
}
