package com.pochak.operation.reservation.dto;

import com.pochak.operation.reservation.entity.Reservation;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.entity.ReservationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
public class CalendarEventResponse {

    private LocalDate date;
    private List<CalendarEvent> events;

    @Getter
    @Builder
    public static class CalendarEvent {
        private Long id;
        private Long venueId;
        private ReservationType reservationType;
        private ReservationStatus status;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String description;
        private Long reservedByUserId;

        public static CalendarEvent from(Reservation reservation) {
            return CalendarEvent.builder()
                    .id(reservation.getId())
                    .venueId(reservation.getVenueId())
                    .reservationType(reservation.getReservationType())
                    .status(reservation.getStatus())
                    .startTime(reservation.getStartTime())
                    .endTime(reservation.getEndTime())
                    .description(reservation.getDescription())
                    .reservedByUserId(reservation.getReservedByUserId())
                    .build();
        }
    }

    public static List<CalendarEventResponse> fromReservations(List<Reservation> reservations) {
        Map<LocalDate, List<Reservation>> grouped = reservations.stream()
                .collect(Collectors.groupingBy(r -> r.getStartTime().toLocalDate()));

        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> CalendarEventResponse.builder()
                        .date(entry.getKey())
                        .events(entry.getValue().stream()
                                .map(CalendarEvent::from)
                                .toList())
                        .build())
                .toList();
    }
}
