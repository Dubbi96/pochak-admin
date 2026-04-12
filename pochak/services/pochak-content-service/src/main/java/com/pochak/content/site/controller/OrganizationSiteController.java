package com.pochak.content.site.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.site.dto.SiteResponse;
import com.pochak.content.site.service.OrganizationSiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrganizationSiteController {

    private final OrganizationSiteService siteService;

    @GetMapping("/public/sites/{ownerType}/{ownerId}")
    public ApiResponse<SiteResponse> getPublishedSite(
            @PathVariable String ownerType,
            @PathVariable Long ownerId) {
        return ApiResponse.success(siteService.getPublishedSite(ownerType.toUpperCase(), ownerId));
    }

    @GetMapping("/sites/{ownerType}/{ownerId}")
    public ApiResponse<SiteResponse> getSite(
            @PathVariable String ownerType,
            @PathVariable Long ownerId) {
        return ApiResponse.success(siteService.getSite(ownerType.toUpperCase(), ownerId));
    }

    @PostMapping("/sites")
    public ApiResponse<SiteResponse> createSite(
            @RequestParam String ownerType,
            @RequestParam Long ownerId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description) {
        return ApiResponse.success(siteService.createSite(ownerType.toUpperCase(), ownerId, title, description));
    }

    @PutMapping("/sites/{siteId}")
    public ApiResponse<SiteResponse> updateSite(
            @PathVariable Long siteId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String metaTitle,
            @RequestParam(required = false) String metaDescription) {
        return ApiResponse.success(siteService.updateSite(siteId, title, description, metaTitle, metaDescription));
    }

    @PatchMapping("/sites/{siteId}/publish")
    public ApiResponse<Void> publishSite(@PathVariable Long siteId) {
        siteService.publishSite(siteId);
        return ApiResponse.success(null);
    }

    @PatchMapping("/sites/{siteId}/unpublish")
    public ApiResponse<Void> unpublishSite(@PathVariable Long siteId) {
        siteService.unpublishSite(siteId);
        return ApiResponse.success(null);
    }
}
