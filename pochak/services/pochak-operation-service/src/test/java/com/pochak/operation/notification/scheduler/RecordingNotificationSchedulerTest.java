package com.pochak.operation.notification.scheduler;

import com.pochak.common.event.EventPublisher;
import com.pochak.operation.event.RecordingReminderEvent;
import com.pochak.operation.notification.entity.RecordingNotificationPreference;
import com.pochak.operation.notification.repository.RecordingNotificationPreferenceRepository;
import com.pochak.operation.schedule.entity.RecordingSchedule;
import com.pochak.operation.schedule.entity.RecordingScheduleStatus;
import com.pochak.operation.schedule.repository.RecordingScheduleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RecordingNotificationSchedulerTest {

    @InjectMocks
    private RecordingNotificationScheduler scheduler;

    @Mock
    private RecordingScheduleRepository scheduleRepository;

    @Mock
    private RecordingNotificationPreferenceRepository preferenceRepository;

    @Mock
    private EventPublisher eventPublisher;

    @Test
    @DisplayName("Should publish reminder event for upcoming recording")
    void testCheckUpcomingRecordings_publishesReminder() {
        // given
        RecordingSchedule schedule = RecordingSchedule.builder()
                .id(1L)
                .userId(50L)
                .venueId(10L)
                .title("Upcoming Game")
                .startTime(LocalDateTime.now().plusMinutes(25))
                .endTime(LocalDateTime.now().plusMinutes(85))
                .status(RecordingScheduleStatus.SCHEDULED)
                .isActive(true)
                .build();

        given(scheduleRepository.findUpcomingForReminder(any(), any(), eq(RecordingScheduleStatus.SCHEDULED)))
                .willReturn(List.of(schedule));
        given(preferenceRepository.findByUserId(50L)).willReturn(Optional.empty());

        // when
        scheduler.checkUpcomingRecordings();

        // then
        verify(eventPublisher).publish(any(RecordingReminderEvent.class));
    }

    @Test
    @DisplayName("Should not publish reminder when user disabled notifications")
    void testCheckUpcomingRecordings_disabledNotification() {
        // given
        RecordingSchedule schedule = RecordingSchedule.builder()
                .id(1L)
                .userId(50L)
                .venueId(10L)
                .title("Upcoming Game")
                .startTime(LocalDateTime.now().plusMinutes(25))
                .endTime(LocalDateTime.now().plusMinutes(85))
                .status(RecordingScheduleStatus.SCHEDULED)
                .isActive(true)
                .build();

        RecordingNotificationPreference pref = RecordingNotificationPreference.builder()
                .userId(50L)
                .reminderEnabled(false)
                .startEnabled(true)
                .build();

        given(scheduleRepository.findUpcomingForReminder(any(), any(), eq(RecordingScheduleStatus.SCHEDULED)))
                .willReturn(List.of(schedule));
        given(preferenceRepository.findByUserId(50L)).willReturn(Optional.of(pref));

        // when
        scheduler.checkUpcomingRecordings();

        // then
        verify(eventPublisher, never()).publish(any());
    }

    @Test
    @DisplayName("Should do nothing when no upcoming recordings")
    void testCheckUpcomingRecordings_noUpcoming() {
        // given
        given(scheduleRepository.findUpcomingForReminder(any(), any(), eq(RecordingScheduleStatus.SCHEDULED)))
                .willReturn(Collections.emptyList());

        // when
        scheduler.checkUpcomingRecordings();

        // then
        verify(eventPublisher, never()).publish(any());
    }

    @Test
    @DisplayName("Should publish start notification for recordings starting now")
    void testCheckStartingRecordings_publishesStart() {
        // given
        RecordingSchedule schedule = RecordingSchedule.builder()
                .id(2L)
                .userId(60L)
                .venueId(10L)
                .title("Starting Game")
                .startTime(LocalDateTime.now().plusSeconds(30))
                .endTime(LocalDateTime.now().plusMinutes(60))
                .status(RecordingScheduleStatus.SCHEDULED)
                .isActive(true)
                .build();

        given(scheduleRepository.findUpcomingForReminder(any(), any(), eq(RecordingScheduleStatus.SCHEDULED)))
                .willReturn(List.of(schedule));
        given(preferenceRepository.findByUserId(60L)).willReturn(Optional.empty());

        // when
        scheduler.checkStartingRecordings();

        // then
        verify(eventPublisher).publish(any(RecordingReminderEvent.class));
    }
}
