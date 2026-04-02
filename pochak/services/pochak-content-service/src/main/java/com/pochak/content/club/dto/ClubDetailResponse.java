package com.pochak.content.club.dto;

import com.pochak.content.organization.entity.Organization;
import com.pochak.content.team.entity.Team;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubDetailResponse {

    private Long teamId;
    private String name;
    private String nameEn;
    private String shortName;
    private String logoUrl;
    private String description;
    private String homeStadium;
    private String siGunGuCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long sportId;
    private String sportName;
    private Long organizationId;
    private OrganizationInfo organization;
    private long memberCount;
    private List<RecentContentItem> recentContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationInfo {
        private Long id;
        private String name;
        private String orgType;
        private String logoUrl;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentContentItem {
        private Long id;
        private String type;
        private String title;
        private String thumbnailUrl;
        private LocalDateTime createdAt;
    }

    public static ClubDetailResponse from(Team team, Organization org, long memberCount,
                                           List<RecentContentItem> recentContent) {
        ClubDetailResponseBuilder builder = ClubDetailResponse.builder()
                .teamId(team.getId())
                .name(team.getName())
                .nameEn(team.getNameEn())
                .shortName(team.getShortName())
                .logoUrl(team.getLogoUrl())
                .description(team.getDescription())
                .homeStadium(team.getHomeStadium())
                .siGunGuCode(team.getSiGunGuCode())
                .latitude(team.getLatitude())
                .longitude(team.getLongitude())
                .sportId(team.getSport() != null ? team.getSport().getId() : null)
                .sportName(team.getSport() != null ? team.getSport().getName() : null)
                .organizationId(team.getOrganizationId())
                .memberCount(memberCount)
                .recentContent(recentContent)
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt());

        if (org != null) {
            builder.organization(OrganizationInfo.builder()
                    .id(org.getId())
                    .name(org.getName())
                    .orgType(org.getOrgType().name())
                    .logoUrl(org.getLogoUrl())
                    .build());
        }

        return builder.build();
    }
}
