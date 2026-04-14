package com.pochak.admin.cs.controller;

import com.pochak.admin.common.ApiResponse;
import com.pochak.admin.cs.dto.CreateFaqRequest;
import com.pochak.admin.cs.dto.FaqResponse;
import com.pochak.admin.cs.dto.UpdateFaqRequest;
import com.pochak.admin.cs.entity.Faq;
import com.pochak.admin.cs.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * FAQ API — 사용자향 + 관리자향 엔드포인트 (항목 57).
 *
 * 사용자향 (인증 불필요):
 *   GET /site/faqs            — 활성 FAQ 목록 (category 필터)
 *   GET /site/faqs/{id}       — 단건 조회
 *
 * 관리자향:
 *   POST   /admin/api/v1/cs/faqs          — 생성
 *   PUT    /admin/api/v1/cs/faqs/{id}     — 수정
 *   DELETE /admin/api/v1/cs/faqs/{id}     — 삭제
 *   PATCH  /admin/api/v1/cs/faqs/{id}/toggle — 활성화/비활성화 토글
 */
@RestController
@RequiredArgsConstructor
public class FaqController {

    private final FaqRepository faqRepository;

    // ──────────────────────────────────────────────
    // 사용자향 (공개, 인증 불필요)
    // ──────────────────────────────────────────────

    /**
     * GET /site/faqs?category=ACCOUNT
     * active=true 인 FAQ만 반환.
     */
    @GetMapping("/site/faqs")
    public ResponseEntity<List<FaqResponse>> listPublicFaqs(
            @RequestParam(required = false) String category) {

        List<Faq> faqs = (category != null)
                ? faqRepository.findByCategoryAndActiveTrueOrderBySortOrderAsc(category)
                : faqRepository.findByActiveTrueOrderByCategoryAscSortOrderAsc();

        return ResponseEntity.ok(faqs.stream().map(FaqResponse::from).toList());
    }

    /**
     * GET /site/faqs/{id}
     */
    @GetMapping("/site/faqs/{id}")
    public ResponseEntity<FaqResponse> getPublicFaq(@PathVariable Long id) {
        Faq faq = findFaq(id);
        if (!faq.getActive()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(FaqResponse.from(faq));
    }

    // ──────────────────────────────────────────────
    // 관리자향
    // ──────────────────────────────────────────────

    /**
     * POST /admin/api/v1/cs/faqs
     */
    @PostMapping("/admin/api/v1/cs/faqs")
    @Transactional
    public ResponseEntity<ApiResponse<FaqResponse>> createFaq(@RequestBody CreateFaqRequest request) {
        Faq faq = Faq.builder()
                .category(request.category())
                .question(request.question())
                .answer(request.answer())
                .sortOrder(request.sortOrder() != null ? request.sortOrder() : 0)
                .active(true)
                .build();

        Faq saved = faqRepository.save(faq);
        URI location = URI.create("/admin/api/v1/cs/faqs/" + saved.getId());
        return ResponseEntity.created(location).body(ApiResponse.ok(FaqResponse.from(saved)));
    }

    /**
     * PUT /admin/api/v1/cs/faqs/{id}
     */
    @PutMapping("/admin/api/v1/cs/faqs/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<FaqResponse>> updateFaq(
            @PathVariable Long id,
            @RequestBody UpdateFaqRequest request) {

        Faq faq = findFaq(id);
        faq.update(request.category(), request.question(), request.answer(), request.sortOrder());
        return ResponseEntity.ok(ApiResponse.ok(FaqResponse.from(faq)));
    }

    /**
     * DELETE /admin/api/v1/cs/faqs/{id}
     */
    @DeleteMapping("/admin/api/v1/cs/faqs/{id}")
    @Transactional
    public ResponseEntity<Void> deleteFaq(@PathVariable Long id) {
        faqRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /admin/api/v1/cs/faqs/{id}/toggle
     * 활성화/비활성화 토글.
     */
    @PatchMapping("/admin/api/v1/cs/faqs/{id}/toggle")
    @Transactional
    public ResponseEntity<ApiResponse<FaqResponse>> toggleFaq(@PathVariable Long id) {
        Faq faq = findFaq(id);
        faq.toggleActive();
        return ResponseEntity.ok(ApiResponse.ok(FaqResponse.from(faq),
                faq.getActive() ? "FAQ 활성화됨" : "FAQ 비활성화됨"));
    }

    private Faq findFaq(Long id) {
        return faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ not found: " + id));
    }
}
