package com.pochak.content.notification.repository;

import com.pochak.content.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId, Pageable pageable);

    long countByTargetUserIdAndIsReadFalse(Long targetUserId);

    /**
     * DATA-001: Delete all notifications for a withdrawn user.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.targetUserId = :userId")
    int deleteAllByTargetUserId(@Param("userId") Long userId);
}
