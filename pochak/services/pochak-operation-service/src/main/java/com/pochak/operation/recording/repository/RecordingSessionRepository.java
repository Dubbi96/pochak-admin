package com.pochak.operation.recording.repository;

import com.pochak.operation.recording.entity.RecordingSession;
import com.pochak.operation.recording.entity.RecordingSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecordingSessionRepository extends JpaRepository<RecordingSession, Long> {

    List<RecordingSession> findByScheduleIdAndStatusIn(Long scheduleId, List<RecordingSessionStatus> statuses);
}
