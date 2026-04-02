package com.pochak.admin.cs.controller;

import com.pochak.admin.cs.entity.Report;
import com.pochak.admin.cs.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/v1/cs/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;

    @GetMapping
    public ResponseEntity<Page<Report>> getReports(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable));
        }
        return ResponseEntity.ok(reportRepository.findAllByOrderByCreatedAtDesc(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + id));
        return ResponseEntity.ok(report);
    }
}
