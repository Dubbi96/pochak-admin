package com.pochak.admin.organization.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * M9: Response from Content Service after toggling organization verification.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationVerifyResponse {
    private Long id;
    private String name;
    private boolean verified;
}
