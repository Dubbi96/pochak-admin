package com.pochak.operation.notification.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceRequest {

    private Boolean reminderEnabled;
    private Boolean startEnabled;
}
