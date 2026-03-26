package com.pochak.identity.auth.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Route D: Foreign user signup with email verification (no phone).
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForeignSignupRequest {

    @NotBlank(message = "Email verified token is required")
    private String emailVerifiedToken;

    @NotBlank(message = "Login ID is required")
    @Size(min = 4, max = 100, message = "Login ID must be between 4 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_\\-]+$", message = "Login ID may only contain letters, numbers, underscores, and hyphens")
    private String loginId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String name;

    @NotNull(message = "Birthday is required")
    private LocalDate birthday;

    private String nationality;

    @NotNull(message = "Consents are required")
    private Map<String, Boolean> consents;

    private List<String> preferences;
}
