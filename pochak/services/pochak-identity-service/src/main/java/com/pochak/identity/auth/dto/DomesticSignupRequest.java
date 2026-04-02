package com.pochak.identity.auth.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Route A: Domestic adult (14+) signup with phone verification.
 */
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DomesticSignupRequest {

    @NotBlank(message = "Phone verified token is required")
    private String phoneVerifiedToken;

    @NotBlank(message = "Login ID is required")
    @Size(min = 4, max = 100, message = "Login ID must be between 4 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_\\-]+$", message = "Login ID may only contain letters, numbers, underscores, and hyphens")
    private String loginId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Birthday is required")
    private LocalDate birthday;

    /**
     * Consent map: key = consent_type (e.g. "TERMS_OF_SERVICE", "PRIVACY_POLICY", "MARKETING"),
     * value = agreed (true/false)
     */
    @NotNull(message = "Consents are required")
    private Map<String, Boolean> consents;

    /**
     * User preferences for content personalization (sport types, areas, etc.)
     */
    private List<String> preferences;
}
