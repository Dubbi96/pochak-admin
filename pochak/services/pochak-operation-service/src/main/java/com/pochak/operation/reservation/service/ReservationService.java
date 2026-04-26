package com.pochak.operation.reservation.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.reservation.dto.*;
import com.pochak.operation.reservation.entity.Reservation;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.repository.ReservationRepository;
import com.pochak.operation.event.ReservationCancelledEvent;
import com.pochak.operation.event.ReservationCreatedEvent;
import com.pochak.operation.client.ContentServiceClient;
import com.pochak.operation.client.MembershipResponse;
import com.pochak.operation.client.MembershipRole;
import com.pochak.operation.client.OrganizationResponse;
import com.pochak.operation.client.ReservationPolicy;
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
    private final ContentServiceClient contentServiceClient;

    @Transactional
    public ReservationResponse createReservation(Long userId, CreateReservationRequest request) {
        // Validate venue exists
        venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Venue not found: " + request.getVenueId()));

        // Enforce organization reservation policy when organizationId is provided
        if (request.getOrganizationId() != null) {
            enforceReservationPolicy(userId, request.getOrganizationId());
        }

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

    /**
     * Enforces the organization's reservationPolicy:
     *   ALL_MEMBERS → user must have any active membership
     *   MANAGER_ONLY → user must be MANAGER or OWNER
     *
     * If Content Service is unavailable (null response), allows the reservation
     * and logs a warning to avoid hard dependency on content-service availability.
     */
    private void enforceReservationPolicy(Long userId, Long orgId) {
        OrganizationResponse org = contentServiceClient.getOrganization(orgId);
        if (org == null) {
            log.warn("[ReservationPolicy] Could not retrieve org {} from content-service — allowing reservation for userId={}",
                    orgId, userId);
            return;
        }

        ReservationPolicy policy = org.getReservationPolicy();
        if (policy == null || policy == ReservationPolicy.ALL_MEMBERS) {
            // Default: any member may reserve
            MembershipResponse membership = contentServiceClient.getMembership(userId, orgId);
            if (membership == null) {
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "You must be a member of organization " + orgId + " to make a reservation");
            }
            log.info("[ReservationPolicy] ALL_MEMBERS check passed: userId={} orgId={} role={}",
                    userId, orgId, membership.getRole());
        } else if (policy == ReservationPolicy.MANAGER_ONLY) {
            MembershipResponse membership = contentServiceClient.getMembership(userId, orgId);
            if (membership == null || (membership.getRole() != MembershipRole.MANAGER
                    && membership.getRole() != MembershipRole.OWNER)) {
                throw new BusinessException(ErrorCode.FORBIDDEN,
                        "Only MANAGER or OWNER can make reservations for organization " + orgId);
            }
            log.info("[ReservationPolicy] MANAGER_ONLY check passed: userId={} orgId={} role={}",
                    userId, orgId, membership.getRole());
        }
    }

    /**
     * Admin: 전체 예약 목록 (status, venueId, date 필터 지원)
     */
    public Page<ReservationResponse> getAdminReservations(ReservationStatus status, Long venueId,
                                                           LocalDate date, Pageable pageable) {
        LocalDateTime dateFrom = date != null ? date.atStartOfDay() : null;
        LocalDateTime dateTo = date != null ? date.plusDays(1).atStartOfDay() : null;

        Page<Reservation> page = reservationRepository.findByFilters(
                venueId, status, null, dateFrom, dateTo, pageable);
        return page.map(ReservationResponse::from);
    }

    /**
     * Admin: 예약 상태 변경 (APPROVED/REJECTED + reason 지원)
     * APPROVED → CONFIRMED, REJECTED → CANCELLED 처리
     */
    @Transactional
    public ReservationResponse adminChangeStatus(Long id, AdminChangeStatusRequest request) {
        Reservation reservation = findById(id);
        ReservationStatus targetStatus = request.getStatus();

        switch (targetStatus) {
            case CONFIRMED -> {
                if (reservation.getStatus() != ReservationStatus.PENDING) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT,
                            "Only PENDING reservations can be approved");
                }
                reservation.confirm();
                log.info("[Admin] Reservation {} approved", id);
            }
            case CANCELLED -> {
                if (reservation.getStatus() == ReservationStatus.COMPLETED
                        || reservation.getStatus() == ReservationStatus.CANCELLED) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT,
                            "Cannot reject a reservation in status: " + reservation.getStatus());
                }
                reservation.cancel();
                log.info("[Admin] Reservation {} rejected. Reason: {}", id, request.getReason());

                eventPublisher.publish(new ReservationCancelledEvent(
                        reservation.getId(),
                        request.getReason() != null ? request.getReason() : "Rejected by admin"));
            }
            default -> throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Admin can only set status to CONFIRMED or CANCELLED, got: " + targetStatus);
        }

        return ReservationResponse.from(reservation);
    }

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Reservation not found: " + id));
    }
}
