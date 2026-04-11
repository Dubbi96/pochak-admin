package com.pochak.operation.notification.scheduler;

import com.pochak.common.event.EventPublisher;
import com.pochak.operation.event.RecordingReminderEvent;
import com.pochak.operation.notification.repository.RecordingNotificationPreferenceRepository;
import com.pochak.operation.schedule.entity.RecordingSchedule;
import com.pochak.operation.schedule.entity.RecordingScheduleStatus;
import com.pochak.operation.schedule.repository.RecordingScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecordingNotificationScheduler {

    private final RecordingScheduleRepository scheduleRepository;
    private final RecordingNotificationPreferenceRepository preferenceRepository;
    private final EventPublisher eventPublisher;

    @Scheduled(fixedRate = 60_000)
    @Transactional(readOnly = true)
    public void checkUpcomingRecordings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindow = now.plusMinutes(30);

        List<RecordingSchedule> upcoming = scheduleRepository.findUpcomingForReminder(
                now, reminderWindow, RecordingScheduleStatus.SCHEDULED);

        for (RecordingSchedule schedule : upcoming) {
            boolean reminderEnabled = preferenceRepository.findByUserId(schedule.getUserId())
                    .map(pref -> pref.getReminderEnabled())
                    .orElse(true);

            if (reminderEnabled) {
                eventPublisher.publish(new RecordingReminderEvent(
                        schedule.getId(),
                        schedule.getUserId(),
                        schedule.getTitle(),
                        schedule.getVenueId(),
                        schedule.getStartTime(),
                        "REMINDER_30MIN"));

                log.info("Published reminder for scheduleId={}, userId={}, startTime={}",
                        schedule.getId(), schedule.getUserId(), schedule.getStartTime());
            }
        }

        if (!upcoming.isEmpty()) {
            log.info("[RecordingNotification] Processed {} upcoming recordings", upcoming.size());
        }
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional(readOnly = true)
    public void checkStartingRecordings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startWindow = now.plusMinutes(1);

        List<RecordingSchedule> starting = scheduleRepository.findUpcomingForReminder(
                now, startWindow, RecordingScheduleStatus.SCHEDULED);

        for (RecordingSchedule schedule : starting) {
            boolean startEnabled = preferenceRepository.findByUserId(schedule.getUserId())
                    .map(pref -> pref.getStartEnabled())
                    .orElse(true);

            if (startEnabled) {
                eventPublisher.publish(new RecordingReminderEvent(
                        schedule.getId(),
                        schedule.getUserId(),
                        schedule.getTitle(),
                        schedule.getVenueId(),
                        schedule.getStartTime(),
                        "RECORDING_START"));

                log.info("Published start notification for scheduleId={}, userId={}",
                        schedule.getId(), schedule.getUserId());
            }
        }
    }
}
