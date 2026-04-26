package com.pochak.identity.notification.repository;

import com.pochak.identity.notification.entity.PushNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushNotificationPreferenceRepository extends JpaRepository<PushNotificationPreference, Long> {

    List<PushNotificationPreference> findByUserId(Long userId);

    Optional<PushNotificationPreference> findByUserIdAndCategory(Long userId, String category);
}
