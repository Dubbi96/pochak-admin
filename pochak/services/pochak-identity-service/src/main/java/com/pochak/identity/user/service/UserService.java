package com.pochak.identity.user.service;

import com.pochak.identity.user.dto.*;

public interface UserService {

    UserProfileResponse getProfile(Long userId);

    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    UserPreferencesResponse getPreferences(Long userId);

    UserPreferencesResponse updatePreferences(Long userId, UpdatePreferencesRequest request);

    UserStatusResponse getUserStatus(Long userId);
}
