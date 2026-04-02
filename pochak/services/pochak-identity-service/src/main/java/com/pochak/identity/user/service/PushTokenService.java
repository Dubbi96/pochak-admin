package com.pochak.identity.user.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.identity.user.dto.PushTokenResponse;
import com.pochak.identity.user.dto.RegisterPushTokenRequest;
import com.pochak.identity.user.entity.User;
import com.pochak.identity.user.entity.UserPushToken;
import com.pochak.identity.user.repository.UserPushTokenRepository;
import com.pochak.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PushTokenService {

    private final UserRepository userRepository;
    private final UserPushTokenRepository pushTokenRepository;

    /**
     * Register or update a push token for the given user.
     * If the same pushToken already exists for another user, it is reassigned.
     */
    @Transactional
    public PushTokenResponse register(Long userId, RegisterPushTokenRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));

        // If this exact token already exists, update ownership
        Optional<UserPushToken> existing = pushTokenRepository.findByPushToken(request.getPushToken());
        if (existing.isPresent()) {
            UserPushToken token = existing.get();
            // If it belongs to a different user, we just log and reassign
            if (!token.getUser().getId().equals(userId)) {
                log.info("Push token reassigned from userId={} to userId={}", token.getUser().getId(), userId);
            }
            // Update fields via a new entity (immutable pattern with @Builder)
            pushTokenRepository.delete(token);
        }

        UserPushToken newToken = UserPushToken.builder()
                .user(user)
                .pushToken(request.getPushToken())
                .deviceType(request.getDeviceType())
                .deviceId(request.getDeviceId())
                .active(true)
                .build();

        pushTokenRepository.save(newToken);
        log.info("Push token registered for userId={}, deviceType={}", userId, request.getDeviceType());
        return PushTokenResponse.from(newToken);
    }

    /**
     * Delete a push token.
     */
    @Transactional
    public void delete(Long userId, String pushToken) {
        UserPushToken token = pushTokenRepository.findByPushToken(pushToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Push token not found"));

        if (!token.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Push token does not belong to this user");
        }

        pushTokenRepository.delete(token);
        log.info("Push token deleted for userId={}", userId);
    }
}
