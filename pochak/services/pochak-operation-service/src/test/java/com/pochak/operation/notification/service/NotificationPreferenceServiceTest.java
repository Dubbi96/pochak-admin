package com.pochak.operation.notification.service;

import com.pochak.operation.notification.dto.NotificationPreferenceRequest;
import com.pochak.operation.notification.dto.NotificationPreferenceResponse;
import com.pochak.operation.notification.entity.RecordingNotificationPreference;
import com.pochak.operation.notification.repository.RecordingNotificationPreferenceRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class NotificationPreferenceServiceTest {

    @InjectMocks
    private NotificationPreferenceService preferenceService;

    @Mock
    private RecordingNotificationPreferenceRepository preferenceRepository;

    @Test
    @DisplayName("Should return default preferences when none exist")
    void testGetPreference_default() {
        // given
        given(preferenceRepository.findByUserId(50L)).willReturn(Optional.empty());

        // when
        NotificationPreferenceResponse result = preferenceService.getPreference(50L);

        // then
        assertThat(result.getUserId()).isEqualTo(50L);
        assertThat(result.isReminderEnabled()).isTrue();
        assertThat(result.isStartEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should return stored preferences")
    void testGetPreference_existing() {
        // given
        RecordingNotificationPreference pref = RecordingNotificationPreference.builder()
                .userId(50L)
                .reminderEnabled(false)
                .startEnabled(true)
                .build();

        given(preferenceRepository.findByUserId(50L)).willReturn(Optional.of(pref));

        // when
        NotificationPreferenceResponse result = preferenceService.getPreference(50L);

        // then
        assertThat(result.isReminderEnabled()).isFalse();
        assertThat(result.isStartEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should update existing preferences")
    void testUpdatePreference_existing() {
        // given
        RecordingNotificationPreference pref = RecordingNotificationPreference.builder()
                .userId(50L)
                .reminderEnabled(true)
                .startEnabled(true)
                .build();

        given(preferenceRepository.findByUserId(50L)).willReturn(Optional.of(pref));

        NotificationPreferenceRequest request = NotificationPreferenceRequest.builder()
                .reminderEnabled(false)
                .startEnabled(false)
                .build();

        // when
        NotificationPreferenceResponse result = preferenceService.updatePreference(50L, request);

        // then
        assertThat(result.isReminderEnabled()).isFalse();
        assertThat(result.isStartEnabled()).isFalse();
    }

    @Test
    @DisplayName("Should create preferences when none exist on update")
    void testUpdatePreference_create() {
        // given
        RecordingNotificationPreference newPref = RecordingNotificationPreference.builder()
                .userId(50L)
                .reminderEnabled(true)
                .startEnabled(true)
                .build();

        given(preferenceRepository.findByUserId(50L)).willReturn(Optional.empty());
        given(preferenceRepository.save(any(RecordingNotificationPreference.class))).willReturn(newPref);

        NotificationPreferenceRequest request = NotificationPreferenceRequest.builder()
                .reminderEnabled(false)
                .build();

        // when
        NotificationPreferenceResponse result = preferenceService.updatePreference(50L, request);

        // then
        assertThat(result.getUserId()).isEqualTo(50L);
    }
}
