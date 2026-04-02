package com.pochak.identity.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class DeletePushTokenRequest {

    @NotBlank(message = "pushToken is required")
    private String pushToken;
}
