package com.pochak.operation.reservation.controller;

import com.pochak.operation.reservation.dto.CalendarEventResponse;
import com.pochak.operation.reservation.dto.CreateReservationRequest;
import com.pochak.operation.reservation.dto.ReservationResponse;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.entity.ReservationType;
import com.pochak.operation.reservation.service.ReservationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReservationControllerTest {

    @InjectMocks
    private ReservationController reservationController;

    @Mock
    private ReservationService reservationService;

    @Nested
    @DisplayName("POST /reservations")
    class CreateReservation {

        @Test
        @DisplayName("Should create a reservation and return it")
        void createReservation_success() {
            // given
            Long userId = 42L;
            LocalDateTime start = LocalDateTime.of(2026, 4, 10, 10, 0);
            LocalDateTime end = LocalDateTime.of(2026, 4, 10, 12, 0);

            CreateReservationRequest request = CreateReservationRequest.builder()
                    .venueId(1L)
                    .reservationType(ReservationType.ONE_TIME)
                    .startTime(start)
                    .endTime(end)
                    .pointCost(100)
                    .description("Test reservation")
                    .build();

            ReservationResponse expectedResponse = ReservationResponse.builder()
                    .id(1L)
                    .venueId(1L)
                    .reservedByUserId(userId)
                    .reservationType(ReservationType.ONE_TIME)
                    .startTime(start)
                    .endTime(end)
                    .pointCost(100)
                    .status(ReservationStatus.PENDING)
                    .description("Test reservation")
                    .build();

            given(reservationService.createReservation(eq(userId), any(CreateReservationRequest.class)))
                    .willReturn(expectedResponse);

            // when
            var response = reservationController.createReservation(userId, request);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData().getId()).isEqualTo(1L);
            assertThat(response.getData().getVenueId()).isEqualTo(1L);
            assertThat(response.getData().getReservedByUserId()).isEqualTo(userId);
            assertThat(response.getData().getStatus()).isEqualTo(ReservationStatus.PENDING);
            verify(reservationService).createReservation(eq(userId), any(CreateReservationRequest.class));
        }
    }

    @Nested
    @DisplayName("GET /reservations")
    class GetReservations {

        @Test
        @DisplayName("Should return reservation list with pagination")
        void getReservations_success() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            ReservationResponse reservation = ReservationResponse.builder()
                    .id(1L)
                    .venueId(1L)
                    .reservedByUserId(42L)
                    .reservationType(ReservationType.ONE_TIME)
                    .status(ReservationStatus.CONFIRMED)
                    .startTime(LocalDateTime.of(2026, 4, 10, 10, 0))
                    .endTime(LocalDateTime.of(2026, 4, 10, 12, 0))
                    .build();
            Page<ReservationResponse> page = new PageImpl<>(List.of(reservation), pageable, 1);
            given(reservationService.getReservations(isNull(), isNull(), isNull(), isNull(), isNull(), eq(pageable)))
                    .willReturn(page);

            // when
            var response = reservationController.getReservations(null, null, null, null, null, pageable);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData()).hasSize(1);
            assertThat(response.getData().get(0).getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
            assertThat(response.getMeta()).isNotNull();
            assertThat(response.getMeta().getTotalCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should filter reservations by venueId and status")
        void getReservations_withFilters() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            Page<ReservationResponse> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            given(reservationService.getReservations(eq(1L), eq(ReservationStatus.PENDING), isNull(), isNull(), isNull(), eq(pageable)))
                    .willReturn(emptyPage);

            // when
            var response = reservationController.getReservations(1L, ReservationStatus.PENDING, null, null, null, pageable);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData()).isEmpty();
        }
    }

    @Nested
    @DisplayName("GET /reservations/calendar")
    class CalendarView {

        @Test
        @DisplayName("Should return calendar events for month view")
        void getCalendarView_month() {
            // given
            LocalDate date = LocalDate.of(2026, 4, 1);
            CalendarEventResponse calendarEvent = CalendarEventResponse.builder()
                    .date(date)
                    .events(List.of(
                            CalendarEventResponse.CalendarEvent.builder()
                                    .id(1L)
                                    .venueId(1L)
                                    .reservationType(ReservationType.ONE_TIME)
                                    .status(ReservationStatus.CONFIRMED)
                                    .startTime(LocalDateTime.of(2026, 4, 1, 10, 0))
                                    .endTime(LocalDateTime.of(2026, 4, 1, 12, 0))
                                    .build()
                    ))
                    .build();
            given(reservationService.getCalendarView(eq("month"), eq(date), isNull()))
                    .willReturn(List.of(calendarEvent));

            // when
            var response = reservationController.getCalendarView("month", date, null);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData()).hasSize(1);
            assertThat(response.getData().get(0).getDate()).isEqualTo(date);
            assertThat(response.getData().get(0).getEvents()).hasSize(1);
        }

        @Test
        @DisplayName("Should return empty calendar when no reservations")
        void getCalendarView_empty() {
            // given
            LocalDate date = LocalDate.of(2026, 4, 1);
            given(reservationService.getCalendarView(eq("month"), eq(date), isNull()))
                    .willReturn(Collections.emptyList());

            // when
            var response = reservationController.getCalendarView("month", date, null);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData()).isEmpty();
        }

        @Test
        @DisplayName("Should filter calendar by venueId")
        void getCalendarView_withVenueId() {
            // given
            LocalDate date = LocalDate.of(2026, 4, 1);
            given(reservationService.getCalendarView(eq("month"), eq(date), eq(1L)))
                    .willReturn(Collections.emptyList());

            // when
            var response = reservationController.getCalendarView("month", date, 1L);

            // then
            assertThat(response.isSuccess()).isTrue();
            verify(reservationService).getCalendarView("month", date, 1L);
        }
    }

    @Nested
    @DisplayName("GET /reservations/{id}")
    class GetReservation {

        @Test
        @DisplayName("Should return a single reservation by id")
        void getReservation_success() {
            // given
            ReservationResponse reservation = ReservationResponse.builder()
                    .id(1L)
                    .venueId(1L)
                    .reservedByUserId(42L)
                    .status(ReservationStatus.PENDING)
                    .build();
            given(reservationService.getReservation(1L)).willReturn(reservation);

            // when
            var response = reservationController.getReservation(1L);

            // then
            assertThat(response.isSuccess()).isTrue();
            assertThat(response.getData().getId()).isEqualTo(1L);
        }
    }
}
