package com.pochak.operation.product.dto;

import com.pochak.operation.product.entity.VenueTimeSlot;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@Builder
public class TimeSlotResponse {

    private Long id;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;

    public static TimeSlotResponse from(VenueTimeSlot slot) {
        return TimeSlotResponse.builder()
                .id(slot.getId())
                .dayOfWeek(slot.getDayOfWeek())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isAvailable(slot.getIsAvailable())
                .build();
    }
}
