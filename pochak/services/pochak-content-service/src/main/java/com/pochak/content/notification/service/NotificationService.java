package com.pochak.content.notification.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.notification.dto.CreateNotificationRequest;
import com.pochak.content.notification.dto.NotificationResponse;
import com.pochak.content.notification.entity.Notification;
import com.pochak.content.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public List<NotificationResponse> createNotifications(CreateNotificationRequest request) {
        List<Notification> notifications = request.getTargetUserIds().stream()
                .map(userId -> Notification.builder()
                        .notificationType(request.getType())
                        .title(request.getTitle())
                        .content(request.getContent())
                        .linkUrl(request.getLinkUrl())
                        .targetUserId(userId)
                        .build())
                .toList();

        List<Notification> saved = notificationRepository.saveAll(notifications);
        return saved.stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByTargetUserIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(NotificationResponse::from);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Notification not found: " + id));

        if (!notification.getTargetUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN,
                    "Cannot mark another user's notification as read");
        }

        notification.markAsRead();
        return NotificationResponse.from(notification);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByTargetUserIdAndIsReadFalse(userId);
    }
}
