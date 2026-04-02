package com.pochak.operation.reservation.dto;

import com.pochak.operation.reservation.entity.Reservation;
import com.pochak.operation.reservation.entity.ReservationStatus;
import com.pochak.operation.reservation.entity.ReservationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReservationResponse {

    private Long id;
    private Long venueId;
    private Long matchId;
    private Long reservedByUserId;
    private ReservationType reservationType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer pointCost;
    private ReservationStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReservationResponse from(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .venueId(reservation.getVenueId())
                .matchId(reservation.getMatchId())
                .reservedByUserId(reservation.getReservedByUserId())
                .reservationType(reservation.getReservationType())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .pointCost(reservation.getPointCost())
                .status(reservation.getStatus())
                .description(reservation.getDescription())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }
}
