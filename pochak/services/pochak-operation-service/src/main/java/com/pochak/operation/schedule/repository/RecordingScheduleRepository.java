package com.pochak.operation.schedule.repository;

import com.pochak.operation.schedule.entity.RecordingSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pochak.operation.schedule.entity.RecordingScheduleStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RecordingScheduleRepository extends JpaRepository<RecordingSchedule, Long> {

    Optional<RecordingSchedule> findByIdAndIsActiveTrue(Long id);

    Page<RecordingSchedule> findByUserIdAndIsActiveTrueOrderByStartTimeDesc(Long userId, Pageable pageable);

    @Query("SELECT rs FROM RecordingSchedule rs WHERE rs.venueId = :venueId " +
            "AND rs.isActive = true " +
            "AND rs.status != 'CANCELLED' " +
            "AND rs.startTime < :endTime AND rs.endTime > :startTime")
    List<RecordingSchedule> findConflicting(
            @Param("venueId") Long venueId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT rs FROM RecordingSchedule rs WHERE rs.venueId = :venueId " +
            "AND rs.isActive = true " +
            "AND rs.status != 'CANCELLED' " +
            "AND rs.id != :excludeId " +
            "AND rs.startTime < :endTime AND rs.endTime > :startTime")
    List<RecordingSchedule> findConflictingExcluding(
            @Param("venueId") Long venueId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Long excludeId);

    @Query("SELECT rs FROM RecordingSchedule rs WHERE rs.isActive = true " +
            "AND rs.status = :status " +
            "AND rs.startTime >= :from AND rs.startTime < :to")
    List<RecordingSchedule> findUpcomingForReminder(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("status") RecordingScheduleStatus status);
}
