package com.pochak.content.notification.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.notification.dto.CreateNotificationRequest;
import com.pochak.content.notification.dto.NotificationResponse;
import com.pochak.content.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<NotificationResponse>> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        return ApiResponse.success(notificationService.createNotifications(request));
    }

    /**
     * Internal endpoint for service-to-service notification creation.
     * Called by Commerce Service (purchase completed), Operation Service (reservation confirmed), etc.
     * Does not require X-User-Id header — target users are specified in the request body.
     */
    @PostMapping("/internal")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<NotificationResponse>> createInternalNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        return ApiResponse.success(notificationService.createNotifications(request));
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getUserNotifications(
            @RequestHeader("X-User-Id") Long userId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<NotificationResponse> page = notificationService.getUserNotifications(userId, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(notificationService.markAsRead(id, userId));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount(
            @RequestHeader("X-User-Id") Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ApiResponse.success(Map.of("unreadCount", count));
    }
}
