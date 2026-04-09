package com.pochak.operation.venue.dto;

import com.pochak.operation.product.entity.VenueTimeSlot;
import com.pochak.operation.venue.entity.VenueClosedDay;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueScheduleResponse {

    private Long venueId;
    private List<TimeSlotItem> timeSlots;
    private List<ClosedDayItem> closedDays;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlotItem {
        private Long id;
        private Long venueProductId;
        private Integer dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Boolean isAvailable;

        public static TimeSlotItem from(VenueTimeSlot slot) {
            return TimeSlotItem.builder()
                    .id(slot.getId())
                    .venueProductId(slot.getVenueProductId())
                    .dayOfWeek(slot.getDayOfWeek())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .isAvailable(slot.getIsAvailable())
                    .build();
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClosedDayItem {
        private Long id;
        private String closedType;
        private Integer dayOfWeek;
        private LocalDate closedDate;
        private String reason;

        public static ClosedDayItem from(VenueClosedDay cd) {
            return ClosedDayItem.builder()
                    .id(cd.getId())
                    .closedType(cd.getClosedType())
                    .dayOfWeek(cd.getDayOfWeek())
                    .closedDate(cd.getClosedDate())
                    .reason(cd.getReason())
                    .build();
        }
    }
}
