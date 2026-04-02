package com.pochak.identity.user.dto;

import com.pochak.identity.user.entity.UserPreference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesResponse {

    private List<SportPreference> preferredSports;
    private List<AreaPreference> preferredAreas;
    private String usagePurpose;

    public static UserPreferencesResponse from(UserPreference preference) {
        return UserPreferencesResponse.builder()
                .preferredSports(preference.getPreferredSports())
                .preferredAreas(preference.getPreferredAreas())
                .usagePurpose(preference.getUsagePurpose())
                .build();
    }

    public static UserPreferencesResponse empty(Long userId) {
        return UserPreferencesResponse.builder()
                .preferredSports(Collections.emptyList())
                .preferredAreas(Collections.emptyList())
                .usagePurpose(null)
                .build();
    }
}
