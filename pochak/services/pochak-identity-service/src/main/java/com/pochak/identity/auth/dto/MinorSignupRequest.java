package com.pochak.identity.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Route B: Domestic minor (under 14) signup with guardian verification.
 */
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class MinorSignupRequest extends DomesticSignupRequest {

    @NotBlank(message = "Guardian verified token is required")
    private String guardianVerifiedToken;

    @NotNull(message = "Guardian user ID is required")
    private Long guardianUserId;

    private String guardianPhone;
}
