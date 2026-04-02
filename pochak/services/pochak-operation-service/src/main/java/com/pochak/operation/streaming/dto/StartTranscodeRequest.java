package com.pochak.operation.streaming.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartTranscodeRequest {

    @NotNull(message = "ingestEndpointId is required")
    private Long ingestEndpointId;

    @Builder.Default
    private TranscodeConfig config = TranscodeConfig.builder().build();
}
