package com.pochak.admin.club.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateClubStatusRequest {

    /** ACTIVE, SUSPENDED, or DISSOLVED */
    private String status;
}
