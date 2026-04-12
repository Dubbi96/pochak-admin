package com.pochak.operation.venue.controller;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.operation.product.entity.VenueTimeSlot;
import com.pochak.operation.product.repository.VenueTimeSlotRepository;
import com.pochak.operation.venue.dto.VenueScheduleRequest;
import com.pochak.operation.venue.dto.VenueScheduleResponse;
import com.pochak.operation.venue.entity.VenueClosedDay;
import com.pochak.operation.venue.repository.VenueClosedDayRepository;
import com.pochak.operation.venue.repository.VenueRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/venues/{venueId}/schedule")
@RequiredArgsConstructor
public class VenueScheduleController {

    private final VenueRepository venueRepository;
    private final VenueTimeSlotRepository venueTimeSlotRepository;
    private final VenueClosedDayRepository venueClosedDayRepository;

    @GetMapping
    public ApiResponse<VenueScheduleResponse> getSchedule(@PathVariable Long venueId) {
        venueRepository.findById(venueId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Venue not found: " + venueId));

        List<VenueTimeSlot> slots = venueTimeSlotRepository.findByVenueId(venueId);
        List<VenueClosedDay> closedDays = venueClosedDayRepository.findByVenueId(venueId);

        return ApiResponse.success(VenueScheduleResponse.builder()
                .venueId(venueId)
                .timeSlots(slots.stream().map(VenueScheduleResponse.TimeSlotItem::from).toList())
                .closedDays(closedDays.stream().map(VenueScheduleResponse.ClosedDayItem::from).toList())
                .build());
    }

    @PutMapping
    public ApiResponse<VenueScheduleResponse> updateSchedule(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long venueId,
            @Valid @RequestBody VenueScheduleRequest request) {

        venueRepository.findById(venueId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Venue not found: " + venueId));

        // 기존 휴무일 전체 교체
        if (request.getClosedDays() != null) {
            venueClosedDayRepository.deleteByVenueId(venueId);
            List<VenueClosedDay> newClosedDays = request.getClosedDays().stream()
                    .map(item -> VenueClosedDay.builder()
                            .venueId(venueId)
                            .closedType(item.getClosedType())
                            .dayOfWeek(item.getDayOfWeek())
                            .closedDate(item.getClosedDate())
                            .reason(item.getReason())
                            .build())
                    .toList();
            venueClosedDayRepository.saveAll(newClosedDays);
        }

        // time slots는 product 단위로 관리되므로 개별 업데이트
        if (request.getTimeSlots() != null) {
            for (VenueScheduleRequest.TimeSlotItem item : request.getTimeSlots()) {
                venueTimeSlotRepository.findByVenueProductIdAndDayOfWeek(item.getVenueProductId(), item.getDayOfWeek())
                        .ifPresentOrElse(
                                slot -> venueTimeSlotRepository.save(VenueTimeSlot.builder()
                                        .id(slot.getId())
                                        .venueProductId(slot.getVenueProductId())
                                        .dayOfWeek(slot.getDayOfWeek())
                                        .startTime(item.getStartTime() != null ? item.getStartTime() : slot.getStartTime())
                                        .endTime(item.getEndTime() != null ? item.getEndTime() : slot.getEndTime())
                                        .isAvailable(item.getIsAvailable() != null ? item.getIsAvailable() : slot.getIsAvailable())
                                        .build()),
                                () -> venueTimeSlotRepository.save(VenueTimeSlot.builder()
                                        .venueProductId(item.getVenueProductId())
                                        .dayOfWeek(item.getDayOfWeek())
                                        .startTime(item.getStartTime())
                                        .endTime(item.getEndTime())
                                        .isAvailable(item.getIsAvailable() != null ? item.getIsAvailable() : true)
                                        .build())
                        );
            }
        }

        return getSchedule(venueId);
    }
}
