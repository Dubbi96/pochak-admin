package com.pochak.content.club.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
public class UpdateClubCustomizationRequest {

    @NotNull
    private Long partnerId;

    private String bannerUrl;
    private String logoUrl;
    private String themeColor;
    private String introText;
    private Object sectionsJson;
    private Map<String, String> socialLinksJson;
}
