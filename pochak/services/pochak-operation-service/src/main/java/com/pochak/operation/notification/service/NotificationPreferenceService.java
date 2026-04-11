package com.pochak.operation.notification.service;

import com.pochak.operation.notification.dto.NotificationPreferenceRequest;
import com.pochak.operation.notification.dto.NotificationPreferenceResponse;
import com.pochak.operation.notification.entity.RecordingNotificationPreference;
import com.pochak.operation.notification.repository.RecordingNotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationPreferenceService {

    private final RecordingNotificationPreferenceRepository preferenceRepository;

    public NotificationPreferenceResponse getPreference(Long userId) {
        RecordingNotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElse(RecordingNotificationPreference.builder()
                        .userId(userId)
                        .reminderEnabled(true)
                        .startEnabled(true)
                        .build());
        return NotificationPreferenceResponse.from(pref);
    }

    @Transactional
    public NotificationPreferenceResponse updatePreference(Long userId, NotificationPreferenceRequest request) {
        RecordingNotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> preferenceRepository.save(
                        RecordingNotificationPreference.builder()
                                .userId(userId)
                                .build()));

        pref.updatePreferences(request.getReminderEnabled(), request.getStartEnabled());
        return NotificationPreferenceResponse.from(pref);
    }
}
