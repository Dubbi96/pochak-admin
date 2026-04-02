package com.pochak.identity.user.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.identity.user.dto.*;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserPreference;
import com.pochak.identity.user.entity.UserStatusHistory;
import com.pochak.identity.user.repository.UserPreferenceRepository;
import com.pochak.identity.user.repository.UserRepository;
import com.pochak.identity.user.repository.UserStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @Mock
    private UserStatusHistoryRepository userStatusHistoryRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@pochak.com")
                .nickname("testuser")
                .name("Test User")
                .phoneNumber("010-1234-5678")
                .birthDate(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.MALE)
                .nationality("KR")
                .profileImageUrl("https://example.com/image.jpg")
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .isMarketing(true)
                .build();
    }

    @Test
    @DisplayName("Should return user profile successfully")
    void testGetProfile_success() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));

        // when
        UserProfileResponse response = userService.getProfile(1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@pochak.com");
        assertThat(response.getPhone()).isEqualTo("010-1234-5678");
        assertThat(response.getName()).isEqualTo("Test User");
        assertThat(response.getBirthday()).isEqualTo(LocalDate.of(1990, 1, 1));
        assertThat(response.getGender()).isEqualTo("MALE");
        assertThat(response.getNationality()).isEqualTo("KR");
        assertThat(response.getProfileImage()).isEqualTo("https://example.com/image.jpg");
        assertThat(response.getStatus()).isEqualTo("ACTIVE");
        assertThat(response.getIsMarketing()).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testGetProfile_notFound() {
        // given
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.getProfile(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should update profile successfully")
    void testUpdateProfile_success() {
        // given
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("Updated Name")
                .phone("010-9876-5432")
                .email("updated@pochak.com")
                .birthday(LocalDate.of(1995, 5, 15))
                .gender(User.Gender.FEMALE)
                .profileImage("https://example.com/new-image.jpg")
                .build();

        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
        given(userRepository.save(any(User.class))).willReturn(testUser);

        // when
        UserProfileResponse response = userService.updateProfile(1L, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Updated Name");
        assertThat(response.getPhone()).isEqualTo("010-9876-5432");
        assertThat(response.getEmail()).isEqualTo("updated@pochak.com");
        assertThat(response.getGender()).isEqualTo("FEMALE");
    }

    @Test
    @DisplayName("Should return preferences successfully")
    void testGetPreferences_success() {
        // given
        List<SportPreference> sports = List.of(
                SportPreference.builder().sportId(1L).sportName("Soccer").build(),
                SportPreference.builder().sportId(2L).sportName("Baseball").build()
        );
        List<AreaPreference> areas = List.of(
                AreaPreference.builder().siGunGuCode("11010").areaName("Jongno-gu").build()
        );

        UserPreference preference = UserPreference.builder()
                .id(1L)
                .user(testUser)
                .preferredSports(sports)
                .preferredAreas(areas)
                .usagePurpose("HOBBY")
                .build();

        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
        given(userPreferenceRepository.findByUserId(1L)).willReturn(Optional.of(preference));

        // when
        UserPreferencesResponse response = userService.getPreferences(1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getPreferredSports()).hasSize(2);
        assertThat(response.getPreferredAreas()).hasSize(1);
        assertThat(response.getUsagePurpose()).isEqualTo("HOBBY");
    }

    @Test
    @DisplayName("Should throw exception when preferred areas exceed 3")
    void testUpdatePreferences_tooManyAreas_throwsException() {
        // given
        List<AreaPreference> areas = List.of(
                AreaPreference.builder().siGunGuCode("11010").areaName("Area1").build(),
                AreaPreference.builder().siGunGuCode("11020").areaName("Area2").build(),
                AreaPreference.builder().siGunGuCode("11030").areaName("Area3").build(),
                AreaPreference.builder().siGunGuCode("11040").areaName("Area4").build()
        );

        UpdatePreferencesRequest request = UpdatePreferencesRequest.builder()
                .preferredAreas(areas)
                .build();

        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));

        // when & then
        assertThatThrownBy(() -> userService.updatePreferences(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Preferred areas cannot exceed 3");
    }

    @Test
    @DisplayName("Should throw exception when preferred sports exceed 5")
    void testUpdatePreferences_tooManySports_throwsException() {
        // given
        List<SportPreference> sports = List.of(
                SportPreference.builder().sportId(1L).sportName("Sport1").build(),
                SportPreference.builder().sportId(2L).sportName("Sport2").build(),
                SportPreference.builder().sportId(3L).sportName("Sport3").build(),
                SportPreference.builder().sportId(4L).sportName("Sport4").build(),
                SportPreference.builder().sportId(5L).sportName("Sport5").build(),
                SportPreference.builder().sportId(6L).sportName("Sport6").build()
        );

        UpdatePreferencesRequest request = UpdatePreferencesRequest.builder()
                .preferredSports(sports)
                .build();

        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));

        // when & then
        assertThatThrownBy(() -> userService.updatePreferences(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Preferred sports cannot exceed 5");
    }

    @Test
    @DisplayName("Should return user status with last status change")
    void testGetUserStatus_success() {
        // given
        UserStatusHistory statusHistory = UserStatusHistory.builder()
                .id(1L)
                .user(testUser)
                .previousStatus(User.UserStatus.INACTIVE)
                .newStatus(User.UserStatus.ACTIVE)
                .createdAt(LocalDateTime.of(2025, 6, 1, 12, 0))
                .build();

        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
        given(userStatusHistoryRepository.findTopByUserIdOrderByCreatedAtDesc(1L))
                .willReturn(Optional.of(statusHistory));

        // when
        UserStatusResponse response = userService.getUserStatus(1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("ACTIVE");
        assertThat(response.getLastStatusChangedAt()).isEqualTo(LocalDateTime.of(2025, 6, 1, 12, 0));
    }

    @Test
    @DisplayName("Should return user status with null last change when no history exists")
    void testGetUserStatus_noHistory() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
        given(userStatusHistoryRepository.findTopByUserIdOrderByCreatedAtDesc(1L))
                .willReturn(Optional.empty());

        // when
        UserStatusResponse response = userService.getUserStatus(1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("ACTIVE");
        assertThat(response.getLastStatusChangedAt()).isNull();
    }
}
