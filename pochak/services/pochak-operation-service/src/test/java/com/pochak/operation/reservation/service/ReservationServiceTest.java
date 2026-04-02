package com.pochak.operation.reservation.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.operation.reservation.dto.*;
import com.pochak.operation.reservation.entity.Reservation;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.entity.ReservationType;
import com.pochak.operation.reservation.repository.ReservationRepository;
import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import com.pochak.operation.venue.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
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
class ReservationServiceTest {

    @InjectMocks
    private ReservationService reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private VenueRepository venueRepository;

    private Venue testVenue;
    private Reservation testReservation;

    @BeforeEach
    void setUp() {
        testVenue = Venue.builder()
                .id(1L)
                .sportId(10L)
                .name("Test Stadium")
                .venueType(VenueType.FIXED)
                .ownerType(OwnerType.B2B)
                .isActive(true)
                .build();

        testReservation = Reservation.builder()
                .id(100L)
                .venueId(1L)
                .reservedByUserId(50L)
                .reservationType(ReservationType.REGULAR)
                .startTime(LocalDateTime.of(2026, 4, 1, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 1, 12, 0))
                .pointCost(100)
                .status(ReservationStatus.PENDING)
                .description("Test reservation")
                .build();
    }

    @Test
    @DisplayName("Should create a reservation successfully")
    void testCreateReservation() {
        // given
        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(1L)
                .reservationType(ReservationType.REGULAR)
                .startTime(LocalDateTime.of(2026, 4, 1, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 1, 12, 0))
                .pointCost(100)
                .description("Test reservation")
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(testVenue));
        given(reservationRepository.findConflicting(eq(1L), any(), any()))
                .willReturn(Collections.emptyList());
        given(reservationRepository.save(any(Reservation.class))).willReturn(testReservation);

        // when
        ReservationResponse result = reservationService.createReservation(50L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getVenueId()).isEqualTo(1L);
        assertThat(result.getReservedByUserId()).isEqualTo(50L);
        assertThat(result.getStatus()).isEqualTo(ReservationStatus.PENDING);
        assertThat(result.getReservationType()).isEqualTo(ReservationType.REGULAR);
    }

    @Test
    @DisplayName("Should reject reservation with conflicting time slot")
    void testConflictingTimeSlot() {
        // given
        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(1L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(LocalDateTime.of(2026, 4, 1, 11, 0))
                .endTime(LocalDateTime.of(2026, 4, 1, 13, 0))
                .build();

        given(venueRepository.findById(1L)).willReturn(Optional.of(testVenue));
        given(reservationRepository.findConflicting(eq(1L), any(), any()))
                .willReturn(List.of(testReservation));

        // when & then
        assertThatThrownBy(() -> reservationService.createReservation(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("conflicts");
    }

    @Test
    @DisplayName("Should change reservation status following valid transitions")
    void testChangeStatus() {
        // given - PENDING -> CONFIRMED
        given(reservationRepository.findById(100L)).willReturn(Optional.of(testReservation));

        ChangeStatusRequest confirmRequest = ChangeStatusRequest.builder()
                .status(ReservationStatus.CONFIRMED)
                .build();

        // when
        ReservationResponse result = reservationService.changeStatus(100L, confirmRequest);

        // then
        assertThat(result.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);

        // given - CONFIRMED -> COMPLETED
        ChangeStatusRequest completeRequest = ChangeStatusRequest.builder()
                .status(ReservationStatus.COMPLETED)
                .build();

        // when
        result = reservationService.changeStatus(100L, completeRequest);

        // then
        assertThat(result.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
    }

    @Test
    @DisplayName("Should reject invalid status transitions")
    void testChangeStatus_invalidTransition() {
        // given - attempt PENDING -> COMPLETED (invalid, must go through CONFIRMED)
        given(reservationRepository.findById(100L)).willReturn(Optional.of(testReservation));

        ChangeStatusRequest request = ChangeStatusRequest.builder()
                .status(ReservationStatus.COMPLETED)
                .build();

        // when & then
        assertThatThrownBy(() -> reservationService.changeStatus(100L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("CONFIRMED");
    }

    @Test
    @DisplayName("Should return calendar view grouped by date")
    void testCalendarView() {
        // given
        Reservation res1 = Reservation.builder()
                .id(1L).venueId(1L).reservedByUserId(50L)
                .reservationType(ReservationType.REGULAR)
                .startTime(LocalDateTime.of(2026, 4, 1, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 1, 12, 0))
                .status(ReservationStatus.CONFIRMED)
                .build();

        Reservation res2 = Reservation.builder()
                .id(2L).venueId(1L).reservedByUserId(51L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(LocalDateTime.of(2026, 4, 1, 14, 0))
                .endTime(LocalDateTime.of(2026, 4, 1, 16, 0))
                .status(ReservationStatus.PENDING)
                .build();

        Reservation res3 = Reservation.builder()
                .id(3L).venueId(1L).reservedByUserId(52L)
                .reservationType(ReservationType.REGULAR)
                .startTime(LocalDateTime.of(2026, 4, 5, 9, 0))
                .endTime(LocalDateTime.of(2026, 4, 5, 11, 0))
                .status(ReservationStatus.CONFIRMED)
                .build();

        given(reservationRepository.findForCalendar(eq(1L), any(), any()))
                .willReturn(List.of(res1, res2, res3));

        // when
        List<CalendarEventResponse> result = reservationService.getCalendarView("month",
                LocalDate.of(2026, 4, 15), 1L);

        // then
        assertThat(result).hasSize(2); // 2 distinct dates
        assertThat(result.get(0).getDate()).isEqualTo(LocalDate.of(2026, 4, 1));
        assertThat(result.get(0).getEvents()).hasSize(2);
        assertThat(result.get(1).getDate()).isEqualTo(LocalDate.of(2026, 4, 5));
        assertThat(result.get(1).getEvents()).hasSize(1);
    }

    @Test
    @DisplayName("Should throw exception when venue not found")
    void testCreateReservation_venueNotFound() {
        // given
        CreateReservationRequest request = CreateReservationRequest.builder()
                .venueId(999L)
                .reservationType(ReservationType.ONE_TIME)
                .startTime(LocalDateTime.of(2026, 4, 1, 10, 0))
                .endTime(LocalDateTime.of(2026, 4, 1, 12, 0))
                .build();

        given(venueRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> reservationService.createReservation(50L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Venue not found");
    }
}
