package com.pochak.content.asset.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.asset.dto.BulkVisibilityRequest;
import com.pochak.content.asset.dto.clip.*;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.service.ClipAssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contents/clips")
@RequiredArgsConstructor
public class ClipController {

    private final ClipAssetService clipAssetService;

    @GetMapping
    public ApiResponse<List<ClipAssetListResponse>> list(
            @RequestParam(required = false) ClipAsset.SourceType sourceType,
            @RequestParam(required = false) LiveAsset.Visibility visibility,
            @RequestParam(required = false) Long matchId,
            @RequestParam(required = false) Long creatorUserId,
            @RequestParam(required = false) Boolean isDisplayed,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ClipAssetListResponse> page = clipAssetService.list(
                sourceType, visibility, matchId, creatorUserId, isDisplayed, pageable);

        return ApiResponse.success(page.getContent(), toPageMeta(page));
    }

    @GetMapping("/search")
    public ApiResponse<List<ClipAssetListResponse>> search(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(clipAssetService.search(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ClipAssetDetailResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.success(clipAssetService.getDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ClipAssetDetailResponse> create(@Valid @RequestBody CreateClipAssetRequest request) {
        return ApiResponse.success(clipAssetService.create(request));
    }

    @PostMapping("/create-from-range")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ClipAssetDetailResponse> createFromRange(
            @Valid @RequestBody CreateClipFromRangeRequest request) {
        return ApiResponse.success(clipAssetService.createFromRange(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ClipAssetDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClipAssetRequest request) {
        return ApiResponse.success(clipAssetService.update(id, request));
    }

    @PutMapping("/bulk-visibility")
    public ApiResponse<Void> bulkUpdateVisibility(@Valid @RequestBody BulkVisibilityRequest request) {
        clipAssetService.bulkUpdateVisibility(request);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> delete(@PathVariable Long id) {
        clipAssetService.delete(id);
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
