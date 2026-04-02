package com.pochak.content.asset.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.asset.dto.BulkVisibilityRequest;
import com.pochak.content.asset.dto.live.*;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.service.LiveAssetService;
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
@RequestMapping("/contents/live")
@RequiredArgsConstructor
public class LiveController {

    private final LiveAssetService liveAssetService;

    @GetMapping
    public ApiResponse<List<LiveAssetListResponse>> list(
            @RequestParam(required = false) LiveAsset.OwnerType ownerType,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) Boolean isDisplayed,
            @RequestParam(required = false) LiveAsset.Visibility visibility,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<LiveAssetListResponse> page = liveAssetService.list(
                ownerType, venueId, dateFrom, dateTo, isDisplayed, visibility, pageable);

        return ApiResponse.success(page.getContent(), toPageMeta(page));
    }

    @GetMapping("/{id}")
    public ApiResponse<LiveAssetDetailResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.success(liveAssetService.getDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LiveAssetDetailResponse> create(@Valid @RequestBody CreateLiveAssetRequest request) {
        return ApiResponse.success(liveAssetService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<LiveAssetDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLiveAssetRequest request) {
        return ApiResponse.success(liveAssetService.update(id, request));
    }

    @PutMapping("/bulk-visibility")
    public ApiResponse<Void> bulkUpdateVisibility(@Valid @RequestBody BulkVisibilityRequest request) {
        liveAssetService.bulkUpdateVisibility(request);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> delete(@PathVariable Long id) {
        liveAssetService.delete(id);
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
