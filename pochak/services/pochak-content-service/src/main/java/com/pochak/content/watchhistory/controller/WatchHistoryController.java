package com.pochak.content.watchhistory.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.watchhistory.dto.RecordWatchEventRequest;
import com.pochak.content.watchhistory.dto.WatchHistoryResponse;
import com.pochak.content.watchhistory.service.WatchHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/me/watch-history")
@RequiredArgsConstructor
public class WatchHistoryController {

    private final WatchHistoryService watchHistoryService;

    @GetMapping
    public ApiResponse<List<WatchHistoryResponse>> getWatchHistory(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<WatchHistoryResponse> page = watchHistoryService.getWatchHistory(userId, pageable);
        return ApiResponse.success(page.getContent(), toPageMeta(page));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WatchHistoryResponse> recordWatchEvent(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @Valid @RequestBody RecordWatchEventRequest request) {

        return ApiResponse.success(watchHistoryService.recordWatchEvent(userId, request));
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
