package com.pochak.content.club.dto;

import com.pochak.content.club.entity.ClubCustomization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubCustomizationResponse {

    private Long id;
    private Long clubId;
    private Long partnerId;
    private String bannerUrl;
    private String logoUrl;
    private String themeColor;
    private String introText;
    private Object sectionsJson;
    private Map<String, String> socialLinksJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ClubCustomizationResponse from(ClubCustomization c) {
        return ClubCustomizationResponse.builder()
                .id(c.getId())
                .clubId(c.getClubId())
                .partnerId(c.getPartnerId())
                .bannerUrl(c.getBannerUrl())
                .logoUrl(c.getLogoUrl())
                .themeColor(c.getThemeColor())
                .introText(c.getIntroText())
                .sectionsJson(c.getSectionsJson())
                .socialLinksJson(c.getSocialLinksJson())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
