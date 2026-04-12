package com.pochak.identity.session.dto;

import com.pochak.identity.session.entity.UserSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class SessionResponse {

    private Long id;
    private String deviceType;
    private String deviceName;
    private String ipAddress;
    private LocalDateTime lastActiveAt;
    private LocalDateTime createdAt;

    public static SessionResponse from(UserSession session) {
        return SessionResponse.builder()
                .id(session.getId())
                .deviceType(session.getDeviceType())
                .deviceName(session.getDeviceName())
                .ipAddress(session.getIpAddress())
                .lastActiveAt(session.getLastActiveAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
