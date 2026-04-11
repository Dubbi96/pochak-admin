package com.pochak.admin.club.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminClubResponse {

    private Long id;
    private String name;
    private String shortName;
    private String logoUrl;
    private Long sportId;
    private String sportName;
    private String siGunGuCode;
    private Long organizationId;
    private long memberCount;
    private Boolean active;
    private String status;
    private LocalDateTime createdAt;
}
