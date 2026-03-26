package com.pochak.gateway.health;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceHealth {

    private String serviceName;
    private String status;
    private String url;
    private long responseTimeMs;
    private LocalDateTime checkedAt;
}
