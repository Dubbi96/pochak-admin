package com.pochak.content.timeline.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.timeline.dto.CreateTimelineEventRequest;
import com.pochak.content.timeline.dto.TimelineEventResponse;
import com.pochak.content.timeline.service.TimelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contents/{type}/{id}/timeline-events")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping
    public ApiResponse<List<TimelineEventResponse>> getTimelineEvents(
            @PathVariable("type") String type,
            @PathVariable("id") Long id) {

        return ApiResponse.success(timelineService.getTimelineEvents(type, id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TimelineEventResponse> createTimelineEvent(
            @PathVariable("type") String type,
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateTimelineEventRequest request) {

        return ApiResponse.success(timelineService.createTimelineEvent(type, id, request));
    }
}
