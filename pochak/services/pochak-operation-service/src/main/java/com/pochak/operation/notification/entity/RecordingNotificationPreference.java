package com.pochak.operation.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recording_notification_preferences", schema = "operation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class RecordingNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(name = "reminder_enabled", nullable = false)
    private Boolean reminderEnabled = true;

    @Builder.Default
    @Column(name = "start_enabled", nullable = false)
    private Boolean startEnabled = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updatePreferences(Boolean reminderEnabled, Boolean startEnabled) {
        if (reminderEnabled != null) this.reminderEnabled = reminderEnabled;
        if (startEnabled != null) this.startEnabled = startEnabled;
    }
}
