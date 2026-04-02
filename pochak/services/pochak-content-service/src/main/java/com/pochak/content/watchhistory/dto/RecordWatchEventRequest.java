package com.pochak.content.watchhistory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordWatchEventRequest {

    @NotBlank(message = "contentType is required")
    private String contentType;

    @NotNull(message = "contentId is required")
    private Long contentId;

    @NotNull(message = "watchedSeconds is required")
    private Integer watchedSeconds;

    @NotNull(message = "totalSeconds is required")
    private Integer totalSeconds;
}
