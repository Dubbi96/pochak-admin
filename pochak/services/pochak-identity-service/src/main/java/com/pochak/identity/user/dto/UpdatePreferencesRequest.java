package com.pochak.identity.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesRequest {

    @Size(max = 5, message = "Preferred sports cannot exceed 5")
    private List<SportPreference> preferredSports;

    @Size(max = 3, message = "Preferred areas cannot exceed 3")
    private List<AreaPreference> preferredAreas;

    private String usagePurpose;
}
