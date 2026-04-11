package com.pochak.operation.reservation.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ReservationTest {

    private Reservation createReservation(ReservationStatus status) {
        Reservation reservation = Reservation.builder()
                .id(1L)
                .venueId(10L)
                .reservedByUserId(50L)
                .reservationType(ReservationType.REGULAR)
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(2))
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
    @DisplayName("Status transition tests")
    class StatusTransitionTest {

        @Test
        @DisplayName("PENDING -> CONFIRMED transition works correctly")
        void confirm_fromPending() {
            Reservation reservation = createReservation(ReservationStatus.PENDING);

            reservation.confirm();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        }

        @Test
        @DisplayName("CONFIRMED -> COMPLETED transition works correctly")
        void complete_fromConfirmed() {
            Reservation reservation = createReservation(ReservationStatus.CONFIRMED);

            reservation.complete();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.COMPLETED);
        }

        @Test
        @DisplayName("Default status is PENDING")
        void defaultStatus_isPending() {
            Reservation reservation = Reservation.builder()
                    .venueId(10L)
                    .reservedByUserId(50L)
                    .reservationType(ReservationType.REGULAR)
                    .startTime(LocalDateTime.now().plusDays(1))
                    .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                    .build();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("Cancel tests")
    class CancelTest {

        @Test
        @DisplayName("PENDING status can be cancelled")
        void cancel_fromPending() {
            Reservation reservation = createReservation(ReservationStatus.PENDING);

            reservation.cancel();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }

        @Test
        @DisplayName("CONFIRMED status can be cancelled")
        void cancel_fromConfirmed() {
            Reservation reservation = createReservation(ReservationStatus.CONFIRMED);

            reservation.cancel();

            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }
    }

    @Nested
    @DisplayName("Builder tests")
    class BuilderTest {

        @Test
        @DisplayName("Builder sets all fields correctly")
        void builder_setsAllFields() {
            LocalDateTime start = LocalDateTime.of(2026, 4, 1, 10, 0);
            LocalDateTime end = LocalDateTime.of(2026, 4, 1, 12, 0);

            Reservation reservation = Reservation.builder()
                    .id(1L)
                    .venueId(10L)
                    .matchId(20L)
                    .reservedByUserId(50L)
                    .reservationType(ReservationType.REGULAR)
                    .startTime(start)
                    .endTime(end)
                    .pointCost(100)
                    .description("Test reservation")
                    .build();

            assertThat(reservation.getId()).isEqualTo(1L);
            assertThat(reservation.getVenueId()).isEqualTo(10L);
            assertThat(reservation.getMatchId()).isEqualTo(20L);
            assertThat(reservation.getReservedByUserId()).isEqualTo(50L);
            assertThat(reservation.getReservationType()).isEqualTo(ReservationType.REGULAR);
            assertThat(reservation.getStartTime()).isEqualTo(start);
            assertThat(reservation.getEndTime()).isEqualTo(end);
            assertThat(reservation.getPointCost()).isEqualTo(100);
            assertThat(reservation.getDescription()).isEqualTo("Test reservation");
            assertThat(reservation.getStatus()).isEqualTo(ReservationStatus.PENDING);
        }

        @Test
        @DisplayName("pointCost can be null")
        void builder_pointCostCanBeNull() {
            Reservation reservation = Reservation.builder()
                    .venueId(10L)
                    .reservedByUserId(50L)
                    .reservationType(ReservationType.ONE_TIME)
                    .startTime(LocalDateTime.now().plusDays(1))
                    .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                    .build();

            assertThat(reservation.getPointCost()).isNull();
        }
    }
}
