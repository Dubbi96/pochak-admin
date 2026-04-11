package com.pochak.operation.reservation.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.operation.reservation.dto.CreateReservationRequest;
import com.pochak.operation.reservation.dto.ReservationResponse;
import com.pochak.operation.reservation.entity.Reservation;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.entity.ReservationType;
import com.pochak.operation.reservation.repository.ReservationRepository;
import com.pochak.operation.product.repository.VenueProductRepository;
import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import com.pochak.operation.venue.repository.VenueRepository;
import com.pochak.common.event.EventPublisher;
import org.junit.jupiter.api.BeforeEach;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ReservationTimeConflictTest {

    @InjectMocks
    private ReservationService reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueProductRepository venueProductRepository;

    @Mock
    private EventPublisher eventPublisher;

    private Venue venue1;
    private Venue venue2;

    @BeforeEach
    void setUp() {
        venue1 = Venue.builder()
                .id(1L)
                .sportId(10L)
                .name("Venue A")
                .venueType(VenueType.FIXED)
                .ownerType(OwnerType.B2B)
                .isActive(true)
                .build();

        venue2 = Venue.builder()
                .id(2L)
                .sportId(10L)
                .name("Venue B")
                .venueType(VenueType.FIXED)
                .ownerType(OwnerType.B2B)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("기존 예약과 시간이 겹치면 예외가 발생한다")
    void createReservation_conflictExists_shouldThrow() {
        // given
        LocalDateTime start = LocalDateTime.of(2026, 5, 1, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 5, 1, 12, 0);

        Reservation existing = Reservation.builder()
                .id(100L)
                .venueId(1L)
                .reservedByUserId(50L)
                .reservationType(ReservationType.REGULAR)
                .startTime(LocalDateTime.of(2026, 5, 1, 9, 0))
                .endTime(LocalDateTime.of(2026, 5, 1, 11, 0))
                .status(ReservationStatus.CONFIRMED)
                .build();

        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(1L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(start)
                .endTime(end)
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(venue1));
        given(reservationRepository.findConflicting(eq(1L), eq(start), eq(end)))
                .willReturn(List.of(existing));

        // when & then
        assertThatThrownBy(() -> reservationService.createReservation(60L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("conflicts");
    }

    @Test
    @DisplayName("시간이 겹치지 않으면 예약이 정상 생성된다")
    void createReservation_noConflict_shouldSucceed() {
        // given
        LocalDateTime start = LocalDateTime.of(2026, 5, 1, 14, 0);
        LocalDateTime end = LocalDateTime.of(2026, 5, 1, 16, 0);

        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(1L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(start)
                .endTime(end)
                .pointCost(5000)
                .build();

        Reservation saved = Reservation.builder()
                .id(200L)
                .venueId(1L)
                .reservedByUserId(60L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(start)
                .endTime(end)
                .pointCost(5000)
                .status(ReservationStatus.PENDING)
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(venue1));
        given(reservationRepository.findConflicting(eq(1L), eq(start), eq(end)))
                .willReturn(Collections.emptyList());
        given(reservationRepository.save(any(Reservation.class))).willReturn(saved);

        // when
        ReservationResponse result = reservationService.createReservation(60L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(ReservationStatus.PENDING);
    }

    @Test
    @DisplayName("인접한 시간 슬롯(기존 종료 = 새 시작)은 충돌하지 않는다")
    void createReservation_adjacentSlots_noConflict() {
        // given: 기존 예약 10:00-12:00, 새 예약 12:00-14:00
        LocalDateTime newStart = LocalDateTime.of(2026, 5, 1, 12, 0);
        LocalDateTime newEnd = LocalDateTime.of(2026, 5, 1, 14, 0);

        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(1L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(newStart)
                .endTime(newEnd)
                .build();

        Reservation saved = Reservation.builder()
                .id(201L)
                .venueId(1L)
                .reservedByUserId(60L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(newStart)
                .endTime(newEnd)
                .status(ReservationStatus.PENDING)
                .build();

        // findConflicting 쿼리: startTime < endTime AND endTime > startTime
        // 기존(10-12): 10 < 14 AND 12 > 12 → false, 따라서 충돌 없음
        given(venueRepository.findById(1L)).willReturn(Optional.of(venue1));
        given(reservationRepository.findConflicting(eq(1L), eq(newStart), eq(newEnd)))
                .willReturn(Collections.emptyList());
        given(reservationRepository.save(any(Reservation.class))).willReturn(saved);

        // when
        ReservationResponse result = reservationService.createReservation(60L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getVenueId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("같은 시간대라도 다른 venue이면 충돌하지 않는다")
    void createReservation_sameTimeDifferentVenue_noConflict() {
        // given: venue 2에 같은 시간으로 예약
        LocalDateTime start = LocalDateTime.of(2026, 5, 1, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 5, 1, 12, 0);

        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(2L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(start)
                .endTime(end)
                .build();

        Reservation saved = Reservation.builder()
                .id(202L)
                .venueId(2L)
                .reservedByUserId(60L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(start)
                .endTime(end)
                .status(ReservationStatus.PENDING)
                .build();

        given(venueRepository.findById(2L)).willReturn(Optional.of(venue2));
        given(reservationRepository.findConflicting(eq(2L), eq(start), eq(end)))
                .willReturn(Collections.emptyList());
        given(reservationRepository.save(any(Reservation.class))).willReturn(saved);

        // when
        ReservationResponse result = reservationService.createReservation(60L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getVenueId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("종료 시간이 시작 시간 이전이면 예외가 발생한다")
    void createReservation_endBeforeStart_shouldThrow() {
        // given
        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(1L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(LocalDateTime.of(2026, 5, 1, 14, 0))
                .endTime(LocalDateTime.of(2026, 5, 1, 10, 0))
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(venue1));

        // when & then
        assertThatThrownBy(() -> reservationService.createReservation(60L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("End time must be after start time");
    }

    @Test
    @DisplayName("시작 시간과 종료 시간이 같으면 예외가 발생한다")
    void createReservation_sameStartAndEnd_shouldThrow() {
        // given
        LocalDateTime sameTime = LocalDateTime.of(2026, 5, 1, 10, 0);

        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(1L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(sameTime)
                .endTime(sameTime)
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(venue1));

        // when & then
        assertThatThrownBy(() -> reservationService.createReservation(60L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("End time must be after start time");
    }
}
