package com.pochak.admin.cs.controller;

import com.pochak.admin.cs.entity.Inquiry;
import com.pochak.admin.cs.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/v1/cs/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryRepository inquiryRepository;

    @GetMapping
    public ResponseEntity<Page<Inquiry>> getInquiries(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(inquiryRepository.findByStatusOrderByCreatedAtDesc(status, pageable));
        }
        return ResponseEntity.ok(inquiryRepository.findAllByOrderByCreatedAtDesc(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inquiry> getInquiry(@PathVariable Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found: " + id));
        return ResponseEntity.ok(inquiry);
    }
}
