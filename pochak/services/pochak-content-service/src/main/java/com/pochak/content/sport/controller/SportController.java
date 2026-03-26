package com.pochak.content.sport.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.sport.dto.*;
import com.pochak.content.sport.service.SportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sports")
@RequiredArgsConstructor
public class SportController {

    private final SportService sportService;

    @GetMapping
    public ApiResponse<List<SportListResponse>> listSports(
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<SportListResponse> page = sportService.listSports(isActive, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{id}")
    public ApiResponse<SportDetailResponse> getSport(@PathVariable Long id) {
        return ApiResponse.success(sportService.getSportDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SportDetailResponse> createSport(@Valid @RequestBody CreateSportRequest request) {
        return ApiResponse.success(sportService.createSport(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<SportDetailResponse> updateSport(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSportRequest request) {
        return ApiResponse.success(sportService.updateSport(id, request));
    }

    @PutMapping("/order")
    public ApiResponse<Void> updateDisplayOrder(@Valid @RequestBody UpdateDisplayOrderRequest request) {
        sportService.updateDisplayOrders(request);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteSport(@PathVariable Long id) {
        sportService.deleteSport(id);
        return ApiResponse.success(null);
    }

    // --- SportTag endpoints ---

    @GetMapping("/{sportId}/tags")
    public ApiResponse<List<SportTagResponse>> getTags(@PathVariable Long sportId) {
        return ApiResponse.success(sportService.getTagsForSport(sportId));
    }

    @PostMapping("/{sportId}/tags")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SportTagResponse> createTag(
            @PathVariable Long sportId,
            @Valid @RequestBody CreateSportTagRequest request) {
        return ApiResponse.success(sportService.createTag(sportId, request));
    }

    @PutMapping("/{sportId}/tags/{tagId}")
    public ApiResponse<SportTagResponse> updateTag(
            @PathVariable Long sportId,
            @PathVariable Long tagId,
            @Valid @RequestBody CreateSportTagRequest request) {
        return ApiResponse.success(sportService.updateTag(sportId, tagId, request));
    }

    @DeleteMapping("/{sportId}/tags/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteTag(
            @PathVariable Long sportId,
            @PathVariable Long tagId) {
        sportService.deleteTag(sportId, tagId);
        return ApiResponse.success(null);
    }
}
