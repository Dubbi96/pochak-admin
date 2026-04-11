package com.pochak.operation.notification.repository;

import com.pochak.operation.notification.entity.RecordingNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecordingNotificationPreferenceRepository extends JpaRepository<RecordingNotificationPreference, Long> {

    Optional<RecordingNotificationPreference> findByUserId(Long userId);
}
