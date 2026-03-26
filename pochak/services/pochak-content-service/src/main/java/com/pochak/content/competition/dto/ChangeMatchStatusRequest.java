package com.pochak.content.competition.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeMatchStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;
}
