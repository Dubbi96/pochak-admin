package com.pochak.operation.schedule.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.schedule.dto.CreateRecordingScheduleRequest;
import com.pochak.operation.schedule.dto.RecordingScheduleResponse;
import com.pochak.operation.schedule.dto.UpdateRecordingScheduleRequest;
import com.pochak.operation.schedule.entity.RecordingSchedule;
import com.pochak.operation.schedule.repository.RecordingScheduleRepository;
import com.pochak.operation.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordingScheduleService {

    private final RecordingScheduleRepository recordingScheduleRepository;
    private final VenueRepository venueRepository;

    @Transactional
    public RecordingScheduleResponse createSchedule(Long userId, CreateRecordingScheduleRequest request) {
        venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Venue not found: " + request.getVenueId()));

        validateTimeRange(request.getStartTime(), request.getEndTime());

        List<RecordingSchedule> conflicts = recordingScheduleRepository.findConflicting(
                request.getVenueId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "Schedule conflicts with existing recording at this venue");
        }

        RecordingSchedule schedule = RecordingSchedule.builder()
                .userId(userId)
                .venueId(request.getVenueId())
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .memo(request.getMemo())
                .build();

        RecordingSchedule saved = recordingScheduleRepository.save(schedule);
        log.info("Recording schedule created: id={}, userId={}, venueId={}", saved.getId(), userId, request.getVenueId());

        return RecordingScheduleResponse.from(saved);
    }

    public Page<RecordingScheduleResponse> getSchedulesByUser(Long userId, Pageable pageable) {
        return recordingScheduleRepository
                .findByUserIdAndIsActiveTrueOrderByStartTimeDesc(userId, pageable)
                .map(RecordingScheduleResponse::from);
    }

    public RecordingScheduleResponse getSchedule(Long id) {
        RecordingSchedule schedule = findActiveById(id);
        return RecordingScheduleResponse.from(schedule);
    }

    @Transactional
    public RecordingScheduleResponse updateSchedule(Long id, UpdateRecordingScheduleRequest request) {
        RecordingSchedule schedule = findActiveById(id);

        validateTimeRange(request.getStartTime(), request.getEndTime());

        List<RecordingSchedule> conflicts = recordingScheduleRepository.findConflictingExcluding(
                schedule.getVenueId(), request.getStartTime(), request.getEndTime(), id);
        if (!conflicts.isEmpty()) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "Schedule conflicts with existing recording at this venue");
        }

        schedule.update(request.getTitle(), request.getStartTime(), request.getEndTime(), request.getMemo());

        return RecordingScheduleResponse.from(schedule);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        RecordingSchedule schedule = findActiveById(id);
        schedule.softDelete();
        log.info("Recording schedule soft-deleted: id={}", id);
    }

    private RecordingSchedule findActiveById(Long id) {
        return recordingScheduleRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Recording schedule not found: " + id));
    }

    private void validateTimeRange(java.time.LocalDateTime startTime, java.time.LocalDateTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "End time must be after start time");
        }
    }
}
