package com.pochak.content.livestream.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.livestream.dto.*;
import com.pochak.content.livestream.entity.LiveStream.StreamStatus;
import com.pochak.content.livestream.service.LiveStreamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/live-streams")
@RequiredArgsConstructor
public class LiveStreamController {

    private final LiveStreamService liveStreamService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LiveStreamResponse> create(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @Valid @RequestBody CreateLiveStreamRequest request) {
        return ApiResponse.success(liveStreamService.create(userId, request));
    }

    @PostMapping("/{id}/start")
    public ApiResponse<LiveStreamResponse> start(
            @PathVariable Long id,
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @RequestBody(required = false) StartLiveStreamRequest request) {
        return ApiResponse.success(liveStreamService.start(id, userId, request));
    }

    @PostMapping("/{id}/stop")
    public ApiResponse<LiveStreamResponse> stop(
            @PathVariable Long id,
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return ApiResponse.success(liveStreamService.stop(id, userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<LiveStreamResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(liveStreamService.getById(id));
    }

    @GetMapping
    public ApiResponse<java.util.List<LiveStreamResponse>> list(
            @RequestParam(required = false) StreamStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<LiveStreamResponse> page = liveStreamService.listByStatus(status, pageable);
        PageMeta meta = PageMeta.of(page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/live")
    public ApiResponse<java.util.List<LiveStreamResponse>> listLive(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<LiveStreamResponse> page = liveStreamService.listLive(pageable);
        PageMeta meta = PageMeta.of(page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
        return ApiResponse.success(page.getContent(), meta);
    }

    @PostMapping("/{id}/viewers/join")
    public ApiResponse<ViewerCountResponse> joinStream(
            @PathVariable Long id,
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return ApiResponse.success(liveStreamService.joinStream(id, userId));
    }

    @PostMapping("/{id}/viewers/leave")
    public ApiResponse<ViewerCountResponse> leaveStream(
            @PathVariable Long id,
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return ApiResponse.success(liveStreamService.leaveStream(id, userId));
    }

    @GetMapping("/{id}/viewers")
    public ApiResponse<ViewerCountResponse> getViewerCount(@PathVariable Long id) {
        return ApiResponse.success(liveStreamService.getViewerCount(id));
    }
}
