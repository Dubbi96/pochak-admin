package com.pochak.content.asset.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.asset.dto.BulkVisibilityRequest;
import com.pochak.content.asset.dto.vod.*;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.service.VodAssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/contents/vod")
@RequiredArgsConstructor
public class VodController {

    private final VodAssetService vodAssetService;

    @GetMapping
    public ApiResponse<List<VodAssetListResponse>> list(
            @RequestParam(required = false) LiveAsset.OwnerType ownerType,
            @RequestParam(required = false) String venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) Boolean isDisplayed,
            @RequestParam(required = false) LiveAsset.Visibility visibility,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<VodAssetListResponse> page = vodAssetService.list(
                ownerType, venueId, dateFrom, dateTo, isDisplayed, visibility, pageable);

        return ApiResponse.success(page.getContent(), toPageMeta(page));
    }

    @GetMapping("/search")
    public ApiResponse<List<VodAssetListResponse>> search(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(vodAssetService.search(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<VodAssetDetailResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.success(vodAssetService.getDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VodAssetDetailResponse> create(@Valid @RequestBody CreateVodAssetRequest request) {
        return ApiResponse.success(vodAssetService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<VodAssetDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVodAssetRequest request) {
        return ApiResponse.success(vodAssetService.update(id, request));
    }

    @PutMapping("/bulk-visibility")
    public ApiResponse<Void> bulkUpdateVisibility(@Valid @RequestBody BulkVisibilityRequest request) {
        vodAssetService.bulkUpdateVisibility(request);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> delete(@PathVariable Long id) {
        vodAssetService.delete(id);
        return ApiResponse.success(null);
    }

    private <T> PageMeta toPageMeta(Page<T> page) {
        return PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
