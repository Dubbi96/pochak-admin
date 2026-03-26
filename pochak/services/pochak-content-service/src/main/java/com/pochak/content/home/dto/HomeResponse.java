package com.pochak.content.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeResponse {

    private List<BannerItem> mainBanners;
    private List<ContentCard> liveContents;
    private List<CompetitionBanner> competitionBanners;
    private List<ContentSection> contentSections;
}
