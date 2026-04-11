package com.pochak.operation.reservation.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.operation.reservation.dto.ChangeStatusRequest;
import com.pochak.operation.reservation.dto.ReservationResponse;
import com.pochak.operation.reservation.entity.*;
import com.pochak.operation.reservation.repository.ReservationRepository;
import com.pochak.operation.event.ReservationCancelledEvent;
import com.pochak.operation.venue.repository.VenueRepository;
import com.pochak.common.event.EventPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationWorkflowTest {

    @InjectMocks
    private ReservationService reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private EventPublisher eventPublisher;

    private Reservation createReservation(ReservationStatus status) {
        Reservation reservation = Reservation.builder()
                .id(100L)
                .venueId(1L)
                .reservedByUserId(50L)
                .reservationType(ReservationType.REGULAR)
                .startTime(LocalDateTime.now().plusDays(3))
                .endTime(LocalDateTime.now().plusDays(3).plusHours(2))
                .pointCost(100)
                .build();

        switch (status) {
            case CONFIRMED -> reservation.confirm();
            case COMPLETED -> {
                reservation.confirm();
                reservation.complete();
            }
            case CANCELLED -> reservation.cancel();
            default -> {
                // PENDING
            }
        }
        return reservation;
    }

    @Nested
    @DisplayName("Valid status transition tests")
    class ValidTransitionTest {

        @Test
        @DisplayName("PENDING -> CONFIRMED transition works correctly")
        void pendingToConfirmed() {
            // given
            Reservation reservation = createReservation(ReservationStatus.PENDING);
            given(reservationRepository.findById(100L)).willReturn(Optional.of(reservation));

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.CONFIRMED)
                    .build();

            // when
            ReservationResponse result = reservationService.changeStatus(100L, request);

            // then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        }

        @Test
        @DisplayName("CONFIRMED -> COMPLETED transition works correctly")
        void confirmedToCompleted() {
            // given
            Reservation reservation = createReservation(ReservationStatus.CONFIRMED);
            given(reservationRepository.findById(100L)).willReturn(Optional.of(reservation));

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.COMPLETED)
                    .build();

            // when
            ReservationResponse result = reservationService.changeStatus(100L, request);

            // then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        }
    }

    @Nested
    @DisplayName("Invalid status transition tests")
    class InvalidTransitionTest {

        @Test
        @DisplayName("COMPLETED -> CONFIRMED transition fails")
        void completedToConfirmed_shouldThrow() {
            // given
            Reservation reservation = createReservation(ReservationStatus.COMPLETED);
            given(reservationRepository.findById(100L)).willReturn(Optional.of(reservation));

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.CONFIRMED)
                    .build();

            // when & then
            assertThatThrownBy(() -> reservationService.changeStatus(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("PENDING");
        }

        @Test
        @DisplayName("PENDING -> COMPLETED transition fails (must go through CONFIRMED)")
        void pendingToCompleted_shouldThrow() {
            // given
            Reservation reservation = createReservation(ReservationStatus.PENDING);
            given(reservationRepository.findById(100L)).willReturn(Optional.of(reservation));

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.COMPLETED)
                    .build();

            // when & then
            assertThatThrownBy(() -> reservationService.changeStatus(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("CONFIRMED");
        }

        @Test
        @DisplayName("COMPLETED -> CANCELLED transition fails")
        void completedToCancelled_shouldThrow() {
            // given
            Reservation reservation = createReservation(ReservationStatus.COMPLETED);
            given(reservationRepository.findById(100L)).willReturn(Optional.of(reservation));

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.CANCELLED)
                    .build();

            // when & then
            assertThatThrownBy(() -> reservationService.changeStatus(100L, request))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("Changing status of non-existent reservation fails")
        void changeStatus_reservationNotFound() {
            // given
            given(reservationRepository.findById(999L)).willReturn(Optional.empty());

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.CONFIRMED)
                    .build();

            // when & then
            assertThatThrownBy(() -> reservationService.changeStatus(999L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Reservation not found");
        }
    }

    @Nested
    @DisplayName("Cancellation workflow tests")
    class CancellationWorkflowTest {

        @Test
        @DisplayName("PENDING reservation can be cancelled and event is published")
        void cancelPending_publishesCancelledEvent() {
            // given
            Reservation reservation = createReservation(ReservationStatus.PENDING);
            given(reservationRepository.findById(100L)).willReturn(Optional.of(reservation));

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.CANCELLED)
                    .build();

            // when
            ReservationResponse result = reservationService.changeStatus(100L, request);

            // then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
            verify(eventPublisher).publish(any(ReservationCancelledEvent.class));
        }

        @Test
        @DisplayName("CONFIRMED reservation can be cancelled")
        void cancelConfirmed_succeeds() {
            // given
            Reservation reservation = createReservation(ReservationStatus.CONFIRMED);
            given(reservationRepository.findById(100L)).willReturn(Optional.of(reservation));

            ChangeStatusRequest request = ChangeStatusRequest.builder()
                    .status(ReservationStatus.CANCELLED)
                    .build();

            // when
            ReservationResponse result = reservationService.changeStatus(100L, request);

            // then
            assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
            verify(eventPublisher).publish(any(ReservationCancelledEvent.class));
        }
    }
}
