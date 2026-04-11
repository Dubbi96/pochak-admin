package com.pochak.operation.recording.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.operation.recording.dto.RecordingSessionResponse;
import com.pochak.operation.recording.dto.StartRecordingSessionRequest;
import com.pochak.operation.recording.service.RecordingSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recording-sessions")
@RequiredArgsConstructor
public class RecordingSessionController {

    private final RecordingSessionService recordingSessionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RecordingSessionResponse> startSession(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody StartRecordingSessionRequest request) {
        return ApiResponse.success(recordingSessionService.startSession(userId, request));
    }

    @PutMapping("/{id}/stop")
    public ApiResponse<RecordingSessionResponse> stopSession(@PathVariable Long id) {
        return ApiResponse.success(recordingSessionService.stopSession(id));
    }

    @PutMapping("/{id}/complete")
    public ApiResponse<RecordingSessionResponse> completeSession(@PathVariable Long id) {
        return ApiResponse.success(recordingSessionService.completeSession(id));
    }

    @GetMapping("/{id}/status")
    public ApiResponse<RecordingSessionResponse> getSessionStatus(@PathVariable Long id) {
        return ApiResponse.success(recordingSessionService.getSessionStatus(id));
    }
}
