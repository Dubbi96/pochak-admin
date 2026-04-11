package com.pochak.admin.site.controller;

import com.pochak.admin.site.entity.Notice;
import com.pochak.admin.site.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/admin/api/v1/site/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeRepository noticeRepository;

    @GetMapping
    public ResponseEntity<Page<Notice>> getNotices(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(noticeRepository.findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notice> getNotice(@PathVariable Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found: " + id));
        return ResponseEntity.ok(notice);
    }

    @PostMapping
    public ResponseEntity<Notice> createNotice(@RequestBody Notice notice) {
        Notice saved = noticeRepository.save(notice);
        return ResponseEntity.created(URI.create("/admin/api/v1/site/notices/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notice> updateNotice(@PathVariable Long id, @RequestBody Notice patch) {
        Notice existing = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found: " + id));

        Notice updated = Notice.builder()
                .id(existing.getId())
                .noticeType(patch.getNoticeType() != null ? patch.getNoticeType() : existing.getNoticeType())
                .title(patch.getTitle() != null ? patch.getTitle() : existing.getTitle())
                .content(patch.getContent() != null ? patch.getContent() : existing.getContent())
                .startDate(patch.getStartDate() != null ? patch.getStartDate() : existing.getStartDate())
                .endDate(patch.getEndDate() != null ? patch.getEndDate() : existing.getEndDate())
                .isPinned(patch.getIsPinned() != null ? patch.getIsPinned() : existing.getIsPinned())
                .isActive(patch.getIsActive() != null ? patch.getIsActive() : existing.getIsActive())
                .createdBy(existing.getCreatedBy())
                .build();
        return ResponseEntity.ok(noticeRepository.save(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
