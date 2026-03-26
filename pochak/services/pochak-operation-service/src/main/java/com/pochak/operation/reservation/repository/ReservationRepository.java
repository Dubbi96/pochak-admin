package com.pochak.operation.reservation.repository;

import com.pochak.operation.reservation.entity.Reservation;
import com.pochak.operation.reservation.entity.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Page<Reservation> findByVenueIdOrderByStartTimeDesc(Long venueId, Pageable pageable);

    Page<Reservation> findByReservedByUserIdOrderByStartTimeDesc(Long userId, Pageable pageable);

    @Query("SELECT r FROM Reservation r WHERE " +
            "(:venueId IS NULL OR r.venueId = :venueId) " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:reservedByUserId IS NULL OR r.reservedByUserId = :reservedByUserId) " +
            "AND (:dateFrom IS NULL OR r.startTime >= :dateFrom) " +
            "AND (:dateTo IS NULL OR r.endTime <= :dateTo) " +
            "ORDER BY r.startTime DESC")
    Page<Reservation> findByFilters(
            @Param("venueId") Long venueId,
            @Param("status") ReservationStatus status,
            @Param("reservedByUserId") Long reservedByUserId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable);

    @Query("SELECT r FROM Reservation r WHERE r.venueId = :venueId " +
            "AND r.status NOT IN ('CANCELLED') " +
            "AND r.startTime < :endTime AND r.endTime > :startTime")
    List<Reservation> findConflicting(
            @Param("venueId") Long venueId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT r FROM Reservation r WHERE " +
            "(:venueId IS NULL OR r.venueId = :venueId) " +
            "AND r.status NOT IN ('CANCELLED') " +
            "AND r.startTime >= :rangeStart AND r.startTime < :rangeEnd " +
            "ORDER BY r.startTime ASC")
    List<Reservation> findForCalendar(
            @Param("venueId") Long venueId,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd);
}
