package com.pochak.operation.partner.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.operation.partner.dto.PartnerDashboardStatsResponse;
import com.pochak.operation.partner.dto.PartnerReservationStatsResponse;
import com.pochak.operation.product.repository.VenueProductRepository;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.repository.ReservationRepository;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerStatsService {

    private final VenueRepository venueRepository;
    private final ReservationRepository reservationRepository;
    private final VenueProductRepository venueProductRepository;

    public PartnerReservationStatsResponse getReservationStats(Long ownerUserId, Long venueId) {
        List<Long> venueIds = resolveVenueIds(ownerUserId, venueId);
        if (venueIds.isEmpty()) {
            return PartnerReservationStatsResponse.builder()
                    .totalActiveReservations(0)
                    .pendingCount(0)
                    .confirmedCount(0)
                    .completedCount(0)
                    .build();
        }

        long pending = reservationRepository.countByVenueIdInAndStatus(venueIds, ReservationStatus.PENDING);
        long confirmed = reservationRepository.countByVenueIdInAndStatus(venueIds, ReservationStatus.CONFIRMED);
        long completed = reservationRepository.countByVenueIdInAndStatus(venueIds, ReservationStatus.COMPLETED);
        long total = pending + confirmed + completed;

        return PartnerReservationStatsResponse.builder()
                .totalActiveReservations(total)
                .pendingCount(pending)
                .confirmedCount(confirmed)
                .completedCount(completed)
                .build();
    }

    public PartnerDashboardStatsResponse getDashboardStats(Long ownerUserId) {
        List<Venue> venues = venueRepository.findByOwnerIdAndIsActiveTrue(ownerUserId);
        int venueCount = venues.size();
        int productCount = (int) venueProductRepository.countByVenueOwnerIdAndIsActiveTrue(ownerUserId);

        LocalDateTime monthStart = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime monthEnd = YearMonth.now().plusMonths(1).atDay(1).atStartOfDay();
        List<Long> venueIds = venues.stream().map(Venue::getId).toList();
        long monthlyReservations = venueIds.isEmpty()
                ? 0
                : reservationRepository.countByVenueIdInAndStartTimeBetweenAndStatusNot(
                        venueIds, monthStart, monthEnd, ReservationStatus.CANCELLED);

        return PartnerDashboardStatsResponse.builder()
                .venueCount(venueCount)
                .productCount(productCount)
                .monthlyReservations(monthlyReservations)
                .monthlyRevenue(BigDecimal.ZERO)
                .build();
    }

    private List<Long> resolveVenueIds(Long ownerUserId, Long venueId) {
        List<Venue> owned = venueRepository.findByOwnerIdAndIsActiveTrue(ownerUserId);
        List<Long> ids = owned.stream().map(Venue::getId).toList();
        if (venueId == null) {
            return ids;
        }
        if (!ids.contains(venueId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Venue is not owned by this partner");
        }
        return List.of(venueId);
    }
}
