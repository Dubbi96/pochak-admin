package com.pochak.content.club.dto;

import com.pochak.content.club.entity.ClubCustomization;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.team.entity.Team;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    private CustomizationInfo customization;
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

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomizationInfo {
        private String bannerUrl;
        private String logoUrl;
        private String themeColor;
        private String introText;
        private Object sectionsJson;
        private Map<String, String> socialLinksJson;
    }

    public static ClubDetailResponse from(Team team, Organization org, long memberCount,
                                           List<RecentContentItem> recentContent,
                                           ClubCustomization customization) {
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

        if (customization != null) {
            builder.customization(CustomizationInfo.builder()
                    .bannerUrl(customization.getBannerUrl())
                    .logoUrl(customization.getLogoUrl())
                    .themeColor(customization.getThemeColor())
                    .introText(customization.getIntroText())
                    .sectionsJson(customization.getSectionsJson())
                    .socialLinksJson(customization.getSocialLinksJson())
                    .build());
        }

        return builder.build();
    }
}
