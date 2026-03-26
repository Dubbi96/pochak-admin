package com.pochak.content.notification.repository;

import com.pochak.content.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId, Pageable pageable);

    long countByTargetUserIdAndIsReadFalse(Long targetUserId);
}
