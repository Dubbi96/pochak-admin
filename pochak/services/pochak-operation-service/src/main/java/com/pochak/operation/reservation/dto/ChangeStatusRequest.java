package com.pochak.operation.reservation.dto;

import com.pochak.operation.reservation.entity.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeStatusRequest {

    @NotNull(message = "Status is required")
    private ReservationStatus status;
}
