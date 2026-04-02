package com.pochak.identity.user.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.user.dto.PushTokenResponse;
import com.pochak.identity.user.dto.RegisterPushTokenRequest;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserPushToken;
import com.pochak.identity.user.repository.UserPushTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PushTokenServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPushTokenRepository pushTokenRepository;

    @InjectMocks
    private PushTokenService pushTokenService;

    private User testUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@pochak.com")
                .nickname("testuser")
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();

        otherUser = User.builder()
                .id(2L)
                .email("other@pochak.com")
                .nickname("otheruser")
                .status(User.UserStatus.ACTIVE)
                .role(User.UserRole.USER)
                .build();
    }

    private RegisterPushTokenRequest buildRegisterRequest(String pushToken, String deviceType, String deviceId) {
        // RegisterPushTokenRequest uses @Getter only (no builder), so we use reflection
        try {
            RegisterPushTokenRequest request = new RegisterPushTokenRequest();
            var pushTokenField = RegisterPushTokenRequest.class.getDeclaredField("pushToken");
            pushTokenField.setAccessible(true);
            pushTokenField.set(request, pushToken);

            var deviceTypeField = RegisterPushTokenRequest.class.getDeclaredField("deviceType");
            deviceTypeField.setAccessible(true);
            deviceTypeField.set(request, deviceType);

            var deviceIdField = RegisterPushTokenRequest.class.getDeclaredField("deviceId");
            deviceIdField.setAccessible(true);
            deviceIdField.set(request, deviceId);

            return request;
        } catch (Exception e) {
            throw new RuntimeException("Failed to build RegisterPushTokenRequest", e);
        }
    }

    // ==================== register tests ====================

    @Nested
    @DisplayName("registerToken")
    class RegisterToken {

        @Test
        @DisplayName("Should register a new push token successfully")
        void newToken_success() {
            // given
            RegisterPushTokenRequest request = buildRegisterRequest("fcm-token-123", "FCM", "device-001");

            given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
            given(pushTokenRepository.findByPushToken("fcm-token-123")).willReturn(Optional.empty());

            UserPushToken savedToken = UserPushToken.builder()
                    .id(10L)
                    .user(testUser)
                    .pushToken("fcm-token-123")
                    .deviceType("FCM")
                    .deviceId("device-001")
                    .active(true)
                    .build();
            given(pushTokenRepository.save(any(UserPushToken.class))).willReturn(savedToken);

            // when
            PushTokenResponse response = pushTokenService.register(1L, request);

            // then
            assertThat(response).isNotNull();
            assertThat(response.getPushToken()).isEqualTo("fcm-token-123");
            assertThat(response.getDeviceType()).isEqualTo("FCM");
            assertThat(response.getActive()).isTrue();

            verify(pushTokenRepository).save(any(UserPushToken.class));
            verify(pushTokenRepository, never()).delete(any(UserPushToken.class));
        }

        @Test
        @DisplayName("Should reassign existing token from another user to current user")
        void existingTokenFromOtherUser_shouldReassign() {
            // given
            RegisterPushTokenRequest request = buildRegisterRequest("shared-token", "FCM", "device-002");

            UserPushToken existingToken = UserPushToken.builder()
                    .id(20L)
                    .user(otherUser)
                    .pushToken("shared-token")
                    .deviceType("FCM")
                    .deviceId("other-device")
                    .active(true)
                    .build();

            given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
            given(pushTokenRepository.findByPushToken("shared-token")).willReturn(Optional.of(existingToken));

            UserPushToken newSavedToken = UserPushToken.builder()
                    .id(21L)
                    .user(testUser)
                    .pushToken("shared-token")
                    .deviceType("FCM")
                    .deviceId("device-002")
                    .active(true)
                    .build();
            given(pushTokenRepository.save(any(UserPushToken.class))).willReturn(newSavedToken);

            // when
            PushTokenResponse response = pushTokenService.register(1L, request);

            // then
            assertThat(response).isNotNull();
            assertThat(response.getPushToken()).isEqualTo("shared-token");

            // Old token should be deleted before saving new one
            verify(pushTokenRepository).delete(existingToken);
            verify(pushTokenRepository).save(any(UserPushToken.class));
        }

        @Test
        @DisplayName("Should update when same user re-registers same token")
        void sameUserReRegister_shouldDeleteAndRecreate() {
            // given
            RegisterPushTokenRequest request = buildRegisterRequest("existing-token", "APNS", "device-003");

            UserPushToken existingToken = UserPushToken.builder()
                    .id(30L)
                    .user(testUser)
                    .pushToken("existing-token")
                    .deviceType("FCM")
                    .deviceId("old-device")
                    .active(true)
                    .build();

            given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
            given(pushTokenRepository.findByPushToken("existing-token")).willReturn(Optional.of(existingToken));

            UserPushToken newSavedToken = UserPushToken.builder()
                    .id(31L)
                    .user(testUser)
                    .pushToken("existing-token")
                    .deviceType("APNS")
                    .deviceId("device-003")
                    .active(true)
                    .build();
            given(pushTokenRepository.save(any(UserPushToken.class))).willReturn(newSavedToken);

            // when
            PushTokenResponse response = pushTokenService.register(1L, request);

            // then
            assertThat(response).isNotNull();
            assertThat(response.getDeviceType()).isEqualTo("APNS");
            verify(pushTokenRepository).delete(existingToken);
            verify(pushTokenRepository).save(any(UserPushToken.class));
        }

        @Test
        @DisplayName("Should throw NOT_FOUND when user does not exist")
        void userNotFound_throwsException() {
            // given
            RegisterPushTokenRequest request = buildRegisterRequest("token", "FCM", null);
            given(userRepository.findById(999L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> pushTokenService.register(999L, request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND);
                    });

            verify(pushTokenRepository, never()).save(any());
        }
    }

    // ==================== delete tests ====================

    @Nested
    @DisplayName("deleteToken")
    class DeleteToken {

        @Test
        @DisplayName("Should delete push token successfully")
        void success() {
            // given
            UserPushToken token = UserPushToken.builder()
                    .id(10L)
                    .user(testUser)
                    .pushToken("token-to-delete")
                    .deviceType("FCM")
                    .active(true)
                    .build();

            given(pushTokenRepository.findByPushToken("token-to-delete")).willReturn(Optional.of(token));

            // when
            pushTokenService.delete(1L, "token-to-delete");

            // then
            verify(pushTokenRepository).delete(token);
        }

        @Test
        @DisplayName("Should throw NOT_FOUND when push token does not exist")
        void tokenNotFound_throwsException() {
            // given
            given(pushTokenRepository.findByPushToken("nonexistent-token")).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> pushTokenService.delete(1L, "nonexistent-token"))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.NOT_FOUND);
                        assertThat(bex.getMessage()).contains("Push token not found");
                    });

            verify(pushTokenRepository, never()).delete(any(UserPushToken.class));
        }

        @Test
        @DisplayName("Should throw FORBIDDEN when token belongs to another user")
        void tokenBelongsToOtherUser_throwsException() {
            // given
            UserPushToken token = UserPushToken.builder()
                    .id(10L)
                    .user(otherUser) // belongs to userId=2
                    .pushToken("other-user-token")
                    .deviceType("FCM")
                    .active(true)
                    .build();

            given(pushTokenRepository.findByPushToken("other-user-token")).willReturn(Optional.of(token));

            // when & then
            assertThatThrownBy(() -> pushTokenService.delete(1L, "other-user-token"))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException bex = (BusinessException) ex;
                        assertThat(bex.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                    });

            verify(pushTokenRepository, never()).delete(any(UserPushToken.class));
        }
    }
}
