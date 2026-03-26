package com.pochak.identity.user.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.user.dto.*;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserPreference;
import com.pochak.identity.user.entity.UserStatusHistory;
import com.pochak.identity.user.repository.UserPreferenceRepository;
import com.pochak.identity.user.repository.UserRepository;
import com.pochak.identity.user.repository.UserStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private static final int MAX_PREFERRED_SPORTS = 5;
    private static final int MAX_PREFERRED_AREAS = 3;

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserStatusHistoryRepository userStatusHistoryRepository;

    @Override
    public UserProfileResponse getProfile(Long userId) {
        User user = findUserById(userId);
        return UserProfileResponse.from(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);
        user.updateProfile(
                request.getName(),
                request.getPhone(),
                request.getEmail(),
                request.getBirthday(),
                request.getGender(),
                request.getProfileImage()
        );
        userRepository.save(user);
        return UserProfileResponse.from(user);
    }

    @Override
    public UserPreferencesResponse getPreferences(Long userId) {
        findUserById(userId);
        UserPreference preference = userPreferenceRepository.findByUserId(userId)
                .orElse(null);
        if (preference == null) {
            return UserPreferencesResponse.empty(userId);
        }
        return UserPreferencesResponse.from(preference);
    }

    @Override
    @Transactional
    public UserPreferencesResponse updatePreferences(Long userId, UpdatePreferencesRequest request) {
        User user = findUserById(userId);
        validatePreferences(request);

        UserPreference preference = userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> UserPreference.builder()
                        .user(user)
                        .build());

        preference.updatePreferences(
                request.getPreferredSports(),
                request.getPreferredAreas(),
                request.getUsagePurpose()
        );

        userPreferenceRepository.save(preference);
        return UserPreferencesResponse.from(preference);
    }

    @Override
    public UserStatusResponse getUserStatus(Long userId) {
        User user = findUserById(userId);
        UserStatusHistory lastChange = userStatusHistoryRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        return UserStatusResponse.builder()
                .status(user.getStatus().name())
                .lastStatusChangedAt(lastChange != null ? lastChange.getCreatedAt() : null)
                .build();
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));
    }

    private void validatePreferences(UpdatePreferencesRequest request) {
        if (request.getPreferredAreas() != null && request.getPreferredAreas().size() > MAX_PREFERRED_AREAS) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Preferred areas cannot exceed " + MAX_PREFERRED_AREAS);
        }
        if (request.getPreferredSports() != null && request.getPreferredSports().size() > MAX_PREFERRED_SPORTS) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Preferred sports cannot exceed " + MAX_PREFERRED_SPORTS);
        }
    }
}
