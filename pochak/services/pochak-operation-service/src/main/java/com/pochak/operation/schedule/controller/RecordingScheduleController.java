package com.pochak.operation.schedule.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.operation.schedule.dto.CreateRecordingScheduleRequest;
import com.pochak.operation.schedule.dto.RecordingScheduleResponse;
import com.pochak.operation.schedule.dto.UpdateRecordingScheduleRequest;
import com.pochak.operation.schedule.service.RecordingScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recording-schedules")
@RequiredArgsConstructor
public class RecordingScheduleController {

    private final RecordingScheduleService recordingScheduleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RecordingScheduleResponse> createSchedule(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateRecordingScheduleRequest request) {
        return ApiResponse.success(recordingScheduleService.createSchedule(userId, request));
    }

    @GetMapping
    public ApiResponse<List<RecordingScheduleResponse>> getMySchedules(
            @RequestParam Long userId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<RecordingScheduleResponse> page = recordingScheduleService.getSchedulesByUser(userId, pageable);

        PageMeta meta = PageMeta.of(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{id}")
    public ApiResponse<RecordingScheduleResponse> getSchedule(@PathVariable Long id) {
        return ApiResponse.success(recordingScheduleService.getSchedule(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<RecordingScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecordingScheduleRequest request) {
        return ApiResponse.success(recordingScheduleService.updateSchedule(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteSchedule(@PathVariable Long id) {
        recordingScheduleService.deleteSchedule(id);
        return ApiResponse.success(null);
    }
}
