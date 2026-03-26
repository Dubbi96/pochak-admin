package com.pochak.content.notification.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.notification.dto.CreateNotificationRequest;
import com.pochak.content.notification.dto.NotificationResponse;
import com.pochak.content.notification.entity.Notification;
import com.pochak.content.notification.entity.NotificationType;
import com.pochak.content.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = Notification.builder()
                .id(1L)
                .notificationType(NotificationType.RESERVATION)
                .title("Reservation Confirmed")
                .content("Your reservation has been confirmed.")
                .linkUrl("/reservations/100")
                .targetUserId(50L)
                .isRead(false)
                .build();
    }

    @Test
    @DisplayName("Should create notifications for multiple target users")
    void testCreateNotification() {
        // given
        CreateNotificationRequest request = CreateNotificationRequest.builder()
                .type(NotificationType.SYSTEM)
                .title("System Maintenance")
                .content("Scheduled maintenance at 2AM.")
                .targetUserIds(List.of(50L, 51L, 52L))
                .build();

        Notification n1 = Notification.builder()
                .id(1L).notificationType(NotificationType.SYSTEM)
                .title("System Maintenance").content("Scheduled maintenance at 2AM.")
                .targetUserId(50L).isRead(false).build();
        Notification n2 = Notification.builder()
                .id(2L).notificationType(NotificationType.SYSTEM)
                .title("System Maintenance").content("Scheduled maintenance at 2AM.")
                .targetUserId(51L).isRead(false).build();
        Notification n3 = Notification.builder()
                .id(3L).notificationType(NotificationType.SYSTEM)
                .title("System Maintenance").content("Scheduled maintenance at 2AM.")
                .targetUserId(52L).isRead(false).build();

        given(notificationRepository.saveAll(anyList())).willReturn(List.of(n1, n2, n3));

        // when
        List<NotificationResponse> result = notificationService.createNotifications(request);

        // then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getType()).isEqualTo(NotificationType.SYSTEM);
        assertThat(result.get(0).getTargetUserId()).isEqualTo(50L);
        assertThat(result.get(1).getTargetUserId()).isEqualTo(51L);
        assertThat(result.get(2).getTargetUserId()).isEqualTo(52L);
    }

    @Test
    @DisplayName("Should return paginated notifications for a user")
    void testGetUserNotifications() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Notification> page = new PageImpl<>(List.of(testNotification), pageable, 1);
        given(notificationRepository.findByTargetUserIdOrderByCreatedAtDesc(50L, pageable))
                .willReturn(page);

        // when
        Page<NotificationResponse> result = notificationService.getUserNotifications(50L, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Reservation Confirmed");
        assertThat(result.getContent().get(0).getIsRead()).isFalse();
    }

    @Test
    @DisplayName("Should mark notification as read")
    void testMarkAsRead() {
        // given
        given(notificationRepository.findById(1L)).willReturn(Optional.of(testNotification));

        // when
        NotificationResponse result = notificationService.markAsRead(1L, 50L);

        // then
        assertThat(result.getIsRead()).isTrue();
    }

    @Test
    @DisplayName("Should reject marking another user's notification as read")
    void testMarkAsRead_forbidden() {
        // given
        given(notificationRepository.findById(1L)).willReturn(Optional.of(testNotification));

        // when & then
        assertThatThrownBy(() -> notificationService.markAsRead(1L, 999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("another user");
    }

    @Test
    @DisplayName("Should return unread count for user")
    void testUnreadCount() {
        // given
        given(notificationRepository.countByTargetUserIdAndIsReadFalse(50L)).willReturn(5L);

        // when
        long count = notificationService.getUnreadCount(50L);

        // then
        assertThat(count).isEqualTo(5L);
    }
}
