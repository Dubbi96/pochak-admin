package com.pochak.identity.user.dto;

import com.pochak.identity.user.entity.UserPushToken;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PushTokenResponse {

    private Long id;
    private String pushToken;
    private String deviceType;
    private String deviceId;
    private Boolean active;
    private LocalDateTime createdAt;

    public static PushTokenResponse from(UserPushToken token) {
        return PushTokenResponse.builder()
                .id(token.getId())
                .pushToken(token.getPushToken())
                .deviceType(token.getDeviceType())
                .deviceId(token.getDeviceId())
                .active(token.getActive())
                .createdAt(token.getCreatedAt())
                .build();
    }
}
