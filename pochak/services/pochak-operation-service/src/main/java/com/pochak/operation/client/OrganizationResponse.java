package com.pochak.operation.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * M8: DTO for organization info returned by Content Service.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationResponse {
    private Long id;
    private String name;
    private ReservationPolicy reservationPolicy;
}
