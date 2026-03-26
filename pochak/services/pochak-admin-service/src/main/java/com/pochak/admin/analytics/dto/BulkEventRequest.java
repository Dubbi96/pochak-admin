package com.pochak.admin.analytics.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkEventRequest {

    private List<EventItem> events;

    @Getter
    @Setter
    public static class EventItem {
        private String name;
        private String userId;
        private String sessionId;
        private String properties;
        private String timestamp;
    }
}
