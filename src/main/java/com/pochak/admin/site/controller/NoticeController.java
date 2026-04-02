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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
