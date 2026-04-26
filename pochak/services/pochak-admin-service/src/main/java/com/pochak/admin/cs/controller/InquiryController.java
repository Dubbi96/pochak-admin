package com.pochak.admin.cs.controller;

import com.pochak.admin.common.AdminPageResponse;
import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.cs.dto.InquiryResponse;
import com.pochak.admin.cs.entity.Inquiry;
import com.pochak.admin.cs.entity.InquiryAnswer;
import com.pochak.admin.cs.repository.InquiryAnswerRepository;
import com.pochak.admin.cs.repository.InquiryRepository;
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
import java.util.Optional;

@RestController
@RequestMapping("/admin/api/v1/cs/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryRepository inquiryRepository;
    private final InquiryAnswerRepository inquiryAnswerRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminPageResponse<InquiryResponse>>> getInquiries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LocalDateTime from = dateFrom != null ? LocalDate.parse(dateFrom).atStartOfDay() : null;
        LocalDateTime to = dateTo != null ? LocalDate.parse(dateTo).atTime(23, 59, 59) : null;
        String keyword = (searchKeyword != null && !searchKeyword.isBlank()) ? searchKeyword : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Inquiry> result = inquiryRepository.findWithFilters(status, category, keyword, from, to, pageable);

        Page<InquiryResponse> mapped = result.map(inquiry -> {
            Optional<InquiryAnswer> answer =
                    inquiryAnswerRepository.findFirstByInquiryIdOrderByCreatedAtDesc(inquiry.getId());
            return InquiryResponse.from(inquiry, answer.orElse(null));
        });

        return ResponseEntity.ok(ApiResponse.ok(AdminPageResponse.from(mapped)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InquiryResponse>> getInquiry(@PathVariable Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found: " + id));
        Optional<InquiryAnswer> answer =
                inquiryAnswerRepository.findFirstByInquiryIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(ApiResponse.ok(InquiryResponse.from(inquiry, answer.orElse(null))));
    }

    @PostMapping("/{id}/reply")
    @Transactional
    public ResponseEntity<ApiResponse<InquiryResponse>> replyToInquiry(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found: " + id));

        String replyContent = body.getOrDefault("reply", "");
        InquiryAnswer answer = InquiryAnswer.builder()
                .inquiryId(id)
                .adminUserId(0L) // TODO: get from SecurityContext
                .content(replyContent)
                .build();
        InquiryAnswer saved = inquiryAnswerRepository.save(answer);

        return ResponseEntity.ok(ApiResponse.ok(InquiryResponse.from(inquiry, saved)));
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<ApiResponse<InquiryResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newStatus = body.getOrDefault("status", "PENDING");
        inquiryRepository.updateStatus(id, newStatus);

        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found: " + id));
        Optional<InquiryAnswer> answer =
                inquiryAnswerRepository.findFirstByInquiryIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(ApiResponse.ok(InquiryResponse.from(inquiry, answer.orElse(null))));
    }
}
