package com.pochak.identity.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusResponse {

    private String status;
    private LocalDateTime lastStatusChangedAt;
}
