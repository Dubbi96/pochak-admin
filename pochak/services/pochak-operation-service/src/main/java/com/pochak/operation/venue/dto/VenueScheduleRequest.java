package com.pochak.operation.venue.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@NoArgsConstructor
public class VenueScheduleRequest {

    private List<TimeSlotItem> timeSlots;
    private List<ClosedDayItem> closedDays;

    @Getter
    @NoArgsConstructor
    public static class TimeSlotItem {
        private Long venueProductId;
        private Integer dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean isAvailable;
    }

    @Getter
    @NoArgsConstructor
    public static class ClosedDayItem {
        private String closedType;  // REGULAR / TEMPORARY
        private Integer dayOfWeek;
        private LocalDate closedDate;
        private String reason;
    }
}
