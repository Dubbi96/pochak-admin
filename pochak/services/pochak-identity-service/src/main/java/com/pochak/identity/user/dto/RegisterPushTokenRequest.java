package com.pochak.identity.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RegisterPushTokenRequest {

    @NotBlank(message = "pushToken is required")
    private String pushToken;

    @NotBlank(message = "deviceType is required (FCM or APNS)")
    private String deviceType;

    private String deviceId;
}
