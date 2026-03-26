package com.pochak.content.club.dto;

import com.pochak.content.team.entity.Team;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubListResponse {

    private Long teamId;
    private String name;
    private String shortName;
    private String logoUrl;
    private Long sportId;
    private String sportName;
    private String siGunGuCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long organizationId;
    private long memberCount;
    private LocalDateTime createdAt;

    public static ClubListResponse from(Team team, long memberCount) {
        return ClubListResponse.builder()
                .teamId(team.getId())
                .name(team.getName())
                .shortName(team.getShortName())
                .logoUrl(team.getLogoUrl())
                .sportId(team.getSport() != null ? team.getSport().getId() : null)
                .sportName(team.getSport() != null ? team.getSport().getName() : null)
                .siGunGuCode(team.getSiGunGuCode())
                .latitude(team.getLatitude())
                .longitude(team.getLongitude())
                .organizationId(team.getOrganizationId())
                .memberCount(memberCount)
                .createdAt(team.getCreatedAt())
                .build();
    }
}
