package com.pochak.identity.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pochak.identity.user.dto.*;
import com.pochak.identity.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private UserProfileResponse testProfile() {
        return UserProfileResponse.builder()
                .id(1L)
                .username("testuser")
                .email("user@example.com")
                .phone("010-1234-5678")
                .name("Test User")
                .birthday(LocalDate.of(2000, 1, 1))
                .gender("MALE")
                .nationality("KR")
                .profileImage("https://example.com/photo.jpg")
                .status("ACTIVE")
                .isMarketing(true)
                .createdAt(LocalDateTime.of(2026, 1, 1, 0, 0))
                .build();
    }

    // ==================== GET /users/me ====================

    @Nested
    @DisplayName("GET /users/me - Get My Profile")
    class GetMyProfileTests {

        @Test
        @DisplayName("Returns user profile with 200")
        void getMyProfile_validUser_returnsProfile() throws Exception {
            given(userService.getProfile(1L)).willReturn(testProfile());

            mockMvc.perform(get("/users/me")
                            .header("X-User-Id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.username").value("testuser"))
                    .andExpect(jsonPath("$.data.email").value("user@example.com"))
                    .andExpect(jsonPath("$.data.name").value("Test User"))
                    .andExpect(jsonPath("$.data.status").value("ACTIVE"));

            verify(userService).getProfile(1L);
        }

        @Test
        @DisplayName("Missing X-User-Id header returns 400")
        void getMyProfile_missingHeader_returns400() throws Exception {
            mockMvc.perform(get("/users/me"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== PUT /users/me ====================

    @Nested
    @DisplayName("PUT /users/me - Update My Profile")
    class UpdateMyProfileTests {

        @Test
        @DisplayName("Valid update returns updated profile with 200")
        void updateMyProfile_valid_returnsUpdatedProfile() throws Exception {
            UpdateProfileRequest request = UpdateProfileRequest.builder()
                    .name("Updated Name")
                    .email("new@example.com")
                    .build();

            UserProfileResponse updatedProfile = UserProfileResponse.builder()
                    .id(1L)
                    .username("testuser")
                    .email("new@example.com")
                    .name("Updated Name")
                    .status("ACTIVE")
                    .build();

            given(userService.updateProfile(eq(1L), any(UpdateProfileRequest.class)))
                    .willReturn(updatedProfile);

            mockMvc.perform(put("/users/me")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.name").value("Updated Name"))
                    .andExpect(jsonPath("$.data.email").value("new@example.com"));

            verify(userService).updateProfile(eq(1L), any(UpdateProfileRequest.class));
        }

        @Test
        @DisplayName("Invalid email format returns 400")
        void updateMyProfile_invalidEmail_returns400() throws Exception {
            String requestJson = "{\"email\": \"not-an-email\"}";

            mockMvc.perform(put("/users/me")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestJson))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Missing X-User-Id header returns 400")
        void updateMyProfile_missingHeader_returns400() throws Exception {
            mockMvc.perform(put("/users/me")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"name\": \"Test\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET /users/me/preferences ====================

    @Nested
    @DisplayName("GET /users/me/preferences - Get My Preferences")
    class GetMyPreferencesTests {

        @Test
        @DisplayName("Returns user preferences with 200")
        void getMyPreferences_returns200() throws Exception {
            UserPreferencesResponse response = UserPreferencesResponse.builder()
                    .preferredSports(Collections.emptyList())
                    .preferredAreas(Collections.emptyList())
                    .usagePurpose("HOBBY")
                    .build();

            given(userService.getPreferences(1L)).willReturn(response);

            mockMvc.perform(get("/users/me/preferences")
                            .header("X-User-Id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.usagePurpose").value("HOBBY"));

            verify(userService).getPreferences(1L);
        }
    }

    // ==================== PUT /users/me/preferences ====================

    @Nested
    @DisplayName("PUT /users/me/preferences - Update My Preferences")
    class UpdateMyPreferencesTests {

        @Test
        @DisplayName("Valid update returns updated preferences with 200")
        void updateMyPreferences_valid_returns200() throws Exception {
            UpdatePreferencesRequest request = UpdatePreferencesRequest.builder()
                    .usagePurpose("FITNESS")
                    .build();

            UserPreferencesResponse response = UserPreferencesResponse.builder()
                    .preferredSports(Collections.emptyList())
                    .preferredAreas(Collections.emptyList())
                    .usagePurpose("FITNESS")
                    .build();

            given(userService.updatePreferences(eq(1L), any(UpdatePreferencesRequest.class)))
                    .willReturn(response);

            mockMvc.perform(put("/users/me/preferences")
                            .header("X-User-Id", "1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.usagePurpose").value("FITNESS"));

            verify(userService).updatePreferences(eq(1L), any(UpdatePreferencesRequest.class));
        }
    }

    // ==================== GET /users/me/status ====================

    @Nested
    @DisplayName("GET /users/me/status - Get My Status")
    class GetMyStatusTests {

        @Test
        @DisplayName("Returns user status with 200")
        void getMyStatus_returns200() throws Exception {
            UserStatusResponse response = UserStatusResponse.builder()
                    .status("ACTIVE")
                    .lastStatusChangedAt(LocalDateTime.of(2026, 3, 1, 12, 0))
                    .build();

            given(userService.getUserStatus(1L)).willReturn(response);

            mockMvc.perform(get("/users/me/status")
                            .header("X-User-Id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.status").value("ACTIVE"));

            verify(userService).getUserStatus(1L);
        }

        @Test
        @DisplayName("Missing X-User-Id header returns 400")
        void getMyStatus_missingHeader_returns400() throws Exception {
            mockMvc.perform(get("/users/me/status"))
                    .andExpect(status().isBadRequest());
        }
    }
}
