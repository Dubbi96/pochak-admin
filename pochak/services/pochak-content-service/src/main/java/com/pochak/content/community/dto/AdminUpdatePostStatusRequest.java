package com.pochak.content.community.dto;

import com.pochak.content.community.entity.ModerationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminUpdatePostStatusRequest {

    @NotNull(message = "status is required")
    private ModerationStatus status;

    private String reason;
}
