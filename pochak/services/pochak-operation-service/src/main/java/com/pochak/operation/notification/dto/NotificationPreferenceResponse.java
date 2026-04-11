package com.pochak.operation.notification.dto;

import com.pochak.operation.notification.entity.RecordingNotificationPreference;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationPreferenceResponse {

    private Long userId;
    private boolean reminderEnabled;
    private boolean startEnabled;

    public static NotificationPreferenceResponse from(RecordingNotificationPreference pref) {
        return NotificationPreferenceResponse.builder()
                .userId(pref.getUserId())
                .reminderEnabled(pref.getReminderEnabled())
                .startEnabled(pref.getStartEnabled())
                .build();
    }
}
