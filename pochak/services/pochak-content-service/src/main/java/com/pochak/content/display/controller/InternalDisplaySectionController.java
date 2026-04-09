package com.pochak.content.display.controller;

import com.pochak.content.display.entity.DisplaySection;
import com.pochak.content.display.repository.DisplaySectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

/**
 * Internal admin endpoint for syncing content from admin service.
 * Called by pochak-admin-service when banners are published/updated/deleted.
 * Not exposed via public gateway.
 */
@Slf4j
@RestController
@RequestMapping("/internal/admin/display-sections")
@RequiredArgsConstructor
public class InternalDisplaySectionController {

    private final DisplaySectionRepository displaySectionRepository;

    @PostMapping("/banner")
    public ResponseEntity<DisplaySection> syncBanner(@RequestBody Map<String, Object> request) {
        String title = (String) request.getOrDefault("title", "Banner");
        String contentQuery = (String) request.getOrDefault("imageUrl", "");
        Integer displayOrder = request.get("sortOrder") != null
                ? ((Number) request.get("sortOrder")).intValue()
                : 0;

        DisplaySection section = DisplaySection.builder()
                .title(title)
                .sectionType("BANNER")
                .contentQuery(contentQuery)
                .displayOrder(displayOrder)
                .active(true)
                .targetPage("HOME")
                .build();

        DisplaySection saved = displaySectionRepository.save(section);
        log.info("Synced banner '{}' to display_sections (id={})", title, saved.getId());
        return ResponseEntity.created(URI.create("/internal/admin/display-sections/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/banner/{adminBannerId}")
    public ResponseEntity<Void> removeBannerSync(@PathVariable Long adminBannerId,
                                                  @RequestParam(required = false) Long displaySectionId) {
        if (displaySectionId != null) {
            displaySectionRepository.deleteById(displaySectionId);
            log.info("Removed display section id={} (synced from admin banner id={})", displaySectionId, adminBannerId);
        }
        return ResponseEntity.noContent().build();
    }
}
