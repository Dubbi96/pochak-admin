package com.pochak.operation.recording.service;

import com.pochak.common.event.EventPublisher;
import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.event.RecordingCompletedEvent;
import com.pochak.operation.recording.dto.RecordingSessionResponse;
import com.pochak.operation.recording.dto.StartRecordingSessionRequest;
import com.pochak.operation.recording.entity.RecordingSession;
import com.pochak.operation.recording.entity.RecordingSessionStatus;
import com.pochak.operation.recording.repository.RecordingSessionRepository;
import com.pochak.operation.schedule.entity.RecordingSchedule;
import com.pochak.operation.schedule.repository.RecordingScheduleRepository;
import com.pochak.operation.vpu.VpuService;
import com.pochak.operation.vpu.dto.RecordingConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordingSessionService {

    private final RecordingSessionRepository recordingSessionRepository;
    private final RecordingScheduleRepository recordingScheduleRepository;
    private final VpuService vpuService;
    private final EventPublisher eventPublisher;

    @Transactional
    public RecordingSessionResponse startSession(Long userId, StartRecordingSessionRequest request) {
        RecordingSchedule schedule = recordingScheduleRepository.findByIdAndIsActiveTrue(request.getScheduleId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Recording schedule not found: " + request.getScheduleId()));

        List<RecordingSession> activeSessions = recordingSessionRepository.findByScheduleIdAndStatusIn(
                request.getScheduleId(),
                List.of(RecordingSessionStatus.RECORDING));
        if (!activeSessions.isEmpty()) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "An active recording session already exists for this schedule");
        }

        RecordingSession session = RecordingSession.builder()
                .scheduleId(request.getScheduleId())
                .cameraId(request.getCameraId())
                .userId(userId)
                .venueId(schedule.getVenueId())
                .build();

        RecordingSession saved = recordingSessionRepository.save(session);

        if (request.getCameraId() != null) {
            RecordingConfig config = RecordingConfig.builder()
                    .cameraId(request.getCameraId())
                    .build();
            vpuService.startRecording(saved.getId(), config);
        }

        log.info("Recording session started: id={}, scheduleId={}, userId={}", saved.getId(), request.getScheduleId(), userId);
        return RecordingSessionResponse.from(saved);
    }

    @Transactional
    public RecordingSessionResponse stopSession(Long sessionId) {
        RecordingSession session = findById(sessionId);

        if (session.getStatus() != RecordingSessionStatus.RECORDING) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Session is not currently recording, status: " + session.getStatus());
        }

        session.stop();

        if (session.getCameraId() != null) {
            vpuService.stopRecording(sessionId);
        }

        log.info("Recording session stopped: id={}", sessionId);
        return RecordingSessionResponse.from(session);
    }

    @Transactional
    public RecordingSessionResponse completeSession(Long sessionId) {
        RecordingSession session = findById(sessionId);

        if (session.getStatus() != RecordingSessionStatus.PAUSED
                && session.getStatus() != RecordingSessionStatus.RECORDING) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Session cannot be completed from status: " + session.getStatus());
        }

        if (session.getStatus() == RecordingSessionStatus.RECORDING && session.getCameraId() != null) {
            vpuService.stopRecording(sessionId);
        }

        session.complete();

        eventPublisher.publish(new RecordingCompletedEvent(
                session.getId(),
                session.getScheduleId(),
                session.getUserId(),
                session.getVenueId(),
                session.getCameraId()));

        log.info("Recording session completed: id={}, triggering upload pipeline", sessionId);
        return RecordingSessionResponse.from(session);
    }

    public RecordingSessionResponse getSessionStatus(Long sessionId) {
        RecordingSession session = findById(sessionId);
        return RecordingSessionResponse.from(session);
    }

    private RecordingSession findById(Long id) {
        return recordingSessionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Recording session not found: " + id));
    }
}
