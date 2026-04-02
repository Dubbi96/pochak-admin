package com.pochak.operation.reservation.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.reservation.dto.*;
import com.pochak.operation.reservation.entity.Reservation;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.repository.ReservationRepository;
import com.pochak.operation.event.ReservationCancelledEvent;
import com.pochak.operation.event.ReservationCreatedEvent;
import com.pochak.operation.venue.repository.VenueRepository;
import com.pochak.common.event.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final VenueRepository venueRepository;
    private final EventPublisher eventPublisher;

    @Transactional
    public ReservationResponse createReservation(Long userId, CreateReservationRequest request) {
        // Validate venue exists
        venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Venue not found: " + request.getVenueId()));

        // TODO: When cross-service communication is available, check org.reservationPolicy
        // The actual check requires calling Content Service to get the owning organization's
        // reservationPolicy (OPEN, MEMBERS_ONLY, MANAGER_ONLY), which depends on inter-service
        // communication (e.g., Feign client or event-based) being set up.
        log.warn("Reservation policy check is pending cross-service integration. " +
                "venueId={}, userId={} — org.reservationPolicy not enforced yet.",
                request.getVenueId(), userId);

        // Validate time
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "End time must be after start time");
        }

        // Check for conflicting time slots
        List<Reservation> conflicts = reservationRepository.findConflicting(
                request.getVenueId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BusinessException(ErrorCode.DUPLICATE,
                    "Time slot conflicts with an existing reservation");
        }

        Reservation reservation = Reservation.builder()
                .venueId(request.getVenueId())
                .matchId(request.getMatchId())
                .reservedByUserId(userId)
                .reservationType(request.getReservationType())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .pointCost(request.getPointCost())
                .description(request.getDescription())
                .build();

        Reservation saved = reservationRepository.save(reservation);

        eventPublisher.publish(new ReservationCreatedEvent(
                saved.getId(), saved.getVenueId(), userId, saved.getStartTime()));

        return ReservationResponse.from(saved);
    }

    public Page<ReservationResponse> getReservations(Long venueId, ReservationStatus status,
                                                      Long reservedByUserId,
                                                      LocalDateTime dateFrom, LocalDateTime dateTo,
                                                      Pageable pageable) {
        Page<Reservation> page = reservationRepository.findByFilters(
                venueId, status, reservedByUserId, dateFrom, dateTo, pageable);
        return page.map(ReservationResponse::from);
    }

    public ReservationResponse getReservation(Long id) {
        Reservation reservation = findById(id);
        return ReservationResponse.from(reservation);
    }

    @Transactional
    public ReservationResponse changeStatus(Long id, ChangeStatusRequest request) {
        Reservation reservation = findById(id);
        ReservationStatus currentStatus = reservation.getStatus();
        ReservationStatus targetStatus = request.getStatus();

        switch (targetStatus) {
            case CONFIRMED -> {
                if (currentStatus != ReservationStatus.PENDING) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT,
                            "Only PENDING reservations can be confirmed");
                }
                reservation.confirm();
            }
            case COMPLETED -> {
                if (currentStatus != ReservationStatus.CONFIRMED) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT,
                            "Only CONFIRMED reservations can be completed");
                }
                reservation.complete();
            }
            case CANCELLED -> {
                if (currentStatus != ReservationStatus.PENDING && currentStatus != ReservationStatus.CONFIRMED) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT,
                            "Only PENDING or CONFIRMED reservations can be cancelled");
                }
                reservation.cancel();

                eventPublisher.publish(new ReservationCancelledEvent(
                        reservation.getId(), "Status changed to CANCELLED"));
            }
            default -> throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Invalid target status: " + targetStatus);
        }

        return ReservationResponse.from(reservation);
    }

    public List<CalendarEventResponse> getCalendarView(String mode, LocalDate date, Long venueId) {
        LocalDateTime rangeStart;
        LocalDateTime rangeEnd;

        switch (mode != null ? mode.toLowerCase() : "month") {
            case "day" -> {
                rangeStart = date.atStartOfDay();
                rangeEnd = date.plusDays(1).atStartOfDay();
            }
            case "week" -> {
                LocalDate weekStart = date.with(WeekFields.of(Locale.getDefault()).dayOfWeek(), 1);
                rangeStart = weekStart.atStartOfDay();
                rangeEnd = weekStart.plusWeeks(1).atStartOfDay();
            }
            default -> { // month
                YearMonth yearMonth = YearMonth.from(date);
                rangeStart = yearMonth.atDay(1).atStartOfDay();
                rangeEnd = yearMonth.plusMonths(1).atDay(1).atStartOfDay();
            }
        }

        List<Reservation> reservations = reservationRepository.findForCalendar(venueId, rangeStart, rangeEnd);
        return CalendarEventResponse.fromReservations(reservations);
    }

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Reservation not found: " + id));
    }
}
