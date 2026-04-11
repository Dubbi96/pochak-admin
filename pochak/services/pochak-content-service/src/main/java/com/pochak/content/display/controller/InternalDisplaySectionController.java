package com.pochak.content.display.controller;

import com.pochak.content.display.entity.DisplaySection;
import com.pochak.content.display.repository.DisplaySectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.Optional;

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
    @CacheEvict(value = "home", key = "'main'")
    public ResponseEntity<DisplaySection> syncBanner(@RequestBody Map<String, Object> request) {
        String title = (String) request.getOrDefault("title", "Banner");
        String imageUrl = (String) request.getOrDefault("imageUrl", "");
        String linkUrl = (String) request.getOrDefault("linkUrl", "");
        Integer displayOrder = request.get("sortOrder") != null
                ? ((Number) request.get("sortOrder")).intValue()
                : 0;
        Long adminBannerId = request.get("adminBannerId") != null
                ? ((Number) request.get("adminBannerId")).longValue()
                : null;

        // Upsert: if a DisplaySection with this adminBannerId already exists, update it
        Optional<DisplaySection> existing = adminBannerId != null
                ? displaySectionRepository.findByAdminBannerId(adminBannerId)
                : Optional.empty();

        DisplaySection section;
        if (existing.isPresent()) {
            DisplaySection current = existing.get();
            section = DisplaySection.builder()
                    .id(current.getId())
                    .title(title)
                    .sectionType("BANNER")
                    .contentQuery(imageUrl)
                    .linkUrl(linkUrl)
                    .adminBannerId(adminBannerId)
                    .displayOrder(displayOrder)
                    .active(true)
                    .targetPage("HOME")
                    .build();
        } else {
            section = DisplaySection.builder()
                    .title(title)
                    .sectionType("BANNER")
                    .contentQuery(imageUrl)
                    .linkUrl(linkUrl)
                    .adminBannerId(adminBannerId)
                    .displayOrder(displayOrder)
                    .active(true)
                    .targetPage("HOME")
                    .build();
        }

        DisplaySection saved = displaySectionRepository.save(section);
        log.info("Synced banner '{}' to display_sections (id={}, adminBannerId={})", title, saved.getId(), adminBannerId);
        return ResponseEntity.created(URI.create("/internal/admin/display-sections/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/banner/{adminBannerId}")
    @CacheEvict(value = "home", key = "'main'")
    public ResponseEntity<Void> removeBannerSync(@PathVariable Long adminBannerId) {
        displaySectionRepository.findByAdminBannerId(adminBannerId)
                .ifPresent(section -> {
                    displaySectionRepository.deleteById(section.getId());
                    log.info("Removed display section id={} (adminBannerId={})", section.getId(), adminBannerId);
                });
        return ResponseEntity.noContent().build();
    }
}
