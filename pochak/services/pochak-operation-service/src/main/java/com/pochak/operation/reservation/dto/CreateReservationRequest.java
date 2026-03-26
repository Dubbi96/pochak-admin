package com.pochak.operation.reservation.dto;

import com.pochak.operation.reservation.entity.ReservationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReservationRequest {

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    private Long matchId;

    @NotNull(message = "Reservation type is required")
    private ReservationType reservationType;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private Integer pointCost;

    private String description;
}
