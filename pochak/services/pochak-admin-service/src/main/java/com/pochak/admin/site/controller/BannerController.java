package com.pochak.admin.site.controller;

import com.pochak.admin.site.client.ContentSyncService;
import com.pochak.admin.site.dto.BannerRequest;
import com.pochak.admin.site.dto.BannerResponse;
import com.pochak.admin.site.entity.Banner;
import com.pochak.admin.site.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/api/v1/site/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerRepository bannerRepository;
    private final ContentSyncService contentSyncService;

    @GetMapping
    public ResponseEntity<Page<BannerResponse>> getBanners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchKeyword) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending());

        Page<Banner> bannerPage;
        if (searchKeyword != null && !searchKeyword.isBlank()) {
            bannerPage = bannerRepository.findByTitleContainingIgnoreCase(searchKeyword, pageable);
        } else if ("PUBLISHED".equals(status)) {
            bannerPage = bannerRepository.findByIsActiveTrue(pageable);
        } else if ("UNPUBLISHED".equals(status)) {
            bannerPage = bannerRepository.findByIsActiveFalse(pageable);
        } else {
            bannerPage = bannerRepository.findAll(pageable);
        }

        return ResponseEntity.ok(bannerPage.map(BannerResponse::from));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BannerResponse> getBanner(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found: " + id));
        return ResponseEntity.ok(BannerResponse.from(banner));
    }

    @PostMapping
    public ResponseEntity<BannerResponse> createBanner(@RequestBody BannerRequest request) {
        Banner saved = bannerRepository.save(request.toEntity());
        if (Boolean.TRUE.equals(saved.getIsActive())) {
            contentSyncService.syncBannerToContent(saved);
        }
        return ResponseEntity.created(URI.create("/admin/api/v1/site/banners/" + saved.getId()))
                .body(BannerResponse.from(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BannerResponse> updateBanner(
            @PathVariable Long id,
            @RequestBody BannerRequest request) {

        Banner existing = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found: " + id));

        Banner patch = request.toEntity();
        Banner updated = Banner.builder()
                .id(existing.getId())
                .title(request.getTitle() != null ? patch.getTitle() : existing.getTitle())
                .pcImageUrl(request.getPcImageUrl() != null ? patch.getPcImageUrl() : existing.getPcImageUrl())
                .mobileImageUrl(request.getMobileImageUrl() != null ? patch.getMobileImageUrl() : existing.getMobileImageUrl())
                .linkUrl(request.getLinkUrl() != null ? patch.getLinkUrl() : existing.getLinkUrl())
                .sortOrder(request.getOrder() != null ? patch.getSortOrder() : existing.getSortOrder())
                .startDate(request.getStartDate() != null ? patch.getStartDate() : existing.getStartDate())
                .endDate(request.getEndDate() != null ? patch.getEndDate() : existing.getEndDate())
                .isActive(request.getStatus() != null ? patch.getIsActive() : existing.getIsActive())
                .build();

        Banner saved = bannerRepository.save(updated);
        if (Boolean.TRUE.equals(saved.getIsActive())) {
            contentSyncService.syncBannerToContent(saved);
        } else {
            contentSyncService.removeBannerFromContent(saved.getId());
        }
        return ResponseEntity.ok(BannerResponse.from(saved));
    }

    @PutMapping("/order")
    public ResponseEntity<Void> updateBannerOrders(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        if (items != null) {
            for (Map<String, Object> item : items) {
                Long bannerId = ((Number) item.get("id")).longValue();
                Integer order = ((Number) item.get("order")).intValue();
                bannerRepository.findById(bannerId).ifPresent(b -> {
                    Banner updated = Banner.builder()
                            .id(b.getId())
                            .title(b.getTitle())
                            .pcImageUrl(b.getPcImageUrl())
                            .mobileImageUrl(b.getMobileImageUrl())
                            .linkUrl(b.getLinkUrl())
                            .sortOrder(order)
                            .startDate(b.getStartDate())
                            .endDate(b.getEndDate())
                            .isActive(b.getIsActive())
                            .build();
                    bannerRepository.save(updated);
                });
            }
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerRepository.deleteById(id);
        contentSyncService.removeBannerFromContent(id);
        return ResponseEntity.noContent().build();
    }
}
